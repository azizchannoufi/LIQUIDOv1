/**
 * Product Form Handler
 * Manages the product addition form with catalog integration
 */

(async function() {
    'use strict';
    
    // Wait for catalog service initialization
    let catalogService;
    try {
        if (window.catalogInit) {
            const catalog = await window.catalogInit;
            catalogService = catalog.service;
        } else {
            catalogService = new CatalogService();
        }
    } catch (error) {
        console.error('Error initializing catalog service:', error);
        catalogService = new CatalogService();
    }
    let currentSection = null;
    let currentBrand = null;
    let brands = [];
    let productImages = []; // Array to store multiple images
    
    // Initialize form
    document.addEventListener('DOMContentLoaded', async () => {
        await initForm();
        initImageHandlers();
    });
    
    async function initForm() {
        // Section selector
        const sectionSelect = document.getElementById('product-section');
        if (sectionSelect) {
            sectionSelect.addEventListener('change', async (e) => {
                currentSection = e.target.value;
                await loadBrandsForSection(currentSection);
            });
        }
        
        // Brand selector
        const brandSelect = document.getElementById('product-brand');
        if (brandSelect) {
            brandSelect.addEventListener('change', async (e) => {
                currentBrand = e.target.value;
                
                if (currentBrand === '__NEW__') {
                    // Show new brand form
                    showNewBrandForm();
                } else {
                    // Hide new brand form and load lines
                    hideNewBrandForm();
                    await loadLinesForBrand(currentBrand, currentSection);
                }
            });
        }
        
        // Toggle new line
        const toggleBtn = document.getElementById('toggle-new-line');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleNewLine);
        }
        
        // Load initial data if editing
        await loadExistingData();
    }
    
    async function loadExistingData() {
        const urlParams = new URLSearchParams(window.location.search);
        const sectionId = urlParams.get('section');
        const brandName = urlParams.get('brand');
        const lineName = urlParams.get('line');
        
        if (sectionId && brandName && lineName) {
            try {
                // Set section
                const sectionSelect = document.getElementById('product-section');
                if (sectionSelect) {
                    sectionSelect.value = sectionId;
                    currentSection = sectionId;
                    await loadBrandsForSection(sectionId);
                }
                
                // Set brand
                const brandSelect = document.getElementById('product-brand');
                if (brandSelect) {
                    brandSelect.value = brandName;
                    currentBrand = brandName;
                    await loadLinesForBrand(brandName, sectionId);
                }
                
                // Set line and load data
                const lineSelect = document.getElementById('product-line');
                if (lineSelect) {
                    lineSelect.value = lineName;
                    
                    // Load line data
                    const lines = await catalogService.getBrandLines(brandName, sectionId);
                    const line = lines.find(l => l.name === lineName);
                    
                    if (line) {
                        // Populate form fields
                        const imageUrlInput = document.getElementById('image-url');
                        if (imageUrlInput) {
                            imageUrlInput.value = '';
                        }
                        
                        // Load images
                        productImages = [];
                        if (line.image_url) {
                            productImages.push(line.image_url);
                        }
                        if (line.images && Array.isArray(line.images)) {
                            // Merge additional images (avoid duplicates)
                            line.images.forEach(img => {
                                if (img && !productImages.includes(img)) {
                                    productImages.push(img);
                                }
                            });
                        }
                        renderImages();
                        
                        // Show new line toggle if needed
                        const toggleBtn = document.getElementById('toggle-new-line');
                        if (toggleBtn) {
                            toggleBtn.textContent = 'Edit existing line';
                        }
                    }
                }
                
                // Update page title
                const pageTitle = document.querySelector('h1');
                if (pageTitle) {
                    pageTitle.textContent = `Edit Product: ${lineName}`;
                }
            } catch (error) {
                console.error('Error loading product data:', error);
            }
        }
    }
    
    async function loadBrandsForSection(sectionId) {
        const brandSelect = document.getElementById('product-brand');
        const lineSelect = document.getElementById('product-line');
        
        if (!brandSelect || !sectionId) return;
        
        try {
            brands = await catalogService.getBrandsBySection(sectionId);
            
            // Clear and populate brand select
            brandSelect.innerHTML = '<option value="">Select Brand...</option>';
            brandSelect.innerHTML += '<option value="__NEW__">➕ Create New Brand</option>';
            
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand.name;
                option.textContent = brand.name;
                brandSelect.appendChild(option);
            });
            
            brandSelect.disabled = false;
            
            // Reset line select
            lineSelect.innerHTML = '<option value="">Select Brand First</option>';
            lineSelect.disabled = true;
            
            // Hide new line container
            const newLineContainer = document.getElementById('new-line-container');
            if (newLineContainer) {
                newLineContainer.classList.add('hidden');
            }
            
            // Show/hide new brand container
            const newBrandContainer = document.getElementById('new-brand-container');
            if (newBrandContainer) {
                newBrandContainer.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading brands:', error);
            brandSelect.innerHTML = '<option value="">Error loading brands</option>';
        }
    }
    
    async function loadLinesForBrand(brandName, sectionId) {
        const lineSelect = document.getElementById('product-line');
        if (!lineSelect || !brandName) return;
        
        try {
            const lines = await catalogService.getBrandLines(brandName, sectionId);
            
            // Clear and populate line select
            lineSelect.innerHTML = '<option value="">Select Line...</option>';
            
            if (lines.length === 0) {
                lineSelect.innerHTML = '<option value="">No lines available - Create new</option>';
            } else {
                lines.forEach(line => {
                    const option = document.createElement('option');
                    option.value = line.name;
                    option.textContent = line.name;
                    lineSelect.appendChild(option);
                });
            }
            
            lineSelect.disabled = false;
        } catch (error) {
            console.error('Error loading lines:', error);
            lineSelect.innerHTML = '<option value="">Error loading lines</option>';
        }
    }
    
    function showNewBrandForm() {
        const newBrandContainer = document.getElementById('new-brand-container');
        const lineSelect = document.getElementById('product-line');
        if (newBrandContainer) {
            newBrandContainer.classList.remove('hidden');
        }
        if (lineSelect) {
            lineSelect.disabled = true;
            lineSelect.innerHTML = '<option value="">Create brand first</option>';
        }
    }
    
    function hideNewBrandForm() {
        const newBrandContainer = document.getElementById('new-brand-container');
        if (newBrandContainer) {
            newBrandContainer.classList.add('hidden');
        }
    }
    
    function toggleNewLine() {
        const newLineContainer = document.getElementById('new-line-container');
        const lineSelect = document.getElementById('product-line');
        const toggleText = document.getElementById('toggle-text');
        
        if (!newLineContainer || !lineSelect) return;
        
        if (newLineContainer.classList.contains('hidden')) {
            // Show new line input
            newLineContainer.classList.remove('hidden');
            lineSelect.disabled = true;
            lineSelect.value = '';
            toggleText.textContent = 'Use Existing Line';
        } else {
            // Hide new line input
            newLineContainer.classList.add('hidden');
            const newLineInput = document.getElementById('new-line-name');
            if (newLineInput) {
                newLineInput.value = '';
            }
            lineSelect.disabled = false;
            toggleText.textContent = 'Create New Line';
        }
    }
    
    function initImageHandlers() {
        const imageUpload = document.getElementById('image-upload');
        const addUrlBtn = document.getElementById('add-url-btn');
        const imageUrlInput = document.getElementById('image-url');
        const uploadArea = imageUpload?.closest('div');
        
        // Handle file upload
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        addImageFromFile(file);
                    }
                });
                // Reset input to allow same file selection
                e.target.value = '';
            });
        }
        
        // Handle drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-primary', 'bg-primary/5');
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-primary', 'bg-primary/5');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-primary', 'bg-primary/5');
                
                const files = Array.from(e.dataTransfer.files);
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        addImageFromFile(file);
                    }
                });
            });
        }
        
        // Handle URL addition
        if (addUrlBtn && imageUrlInput) {
            addUrlBtn.addEventListener('click', () => {
                const url = imageUrlInput.value.trim();
                if (url) {
                    addImageFromUrl(url);
                    imageUrlInput.value = '';
                }
            });
            
            // Allow Enter key
            imageUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrlBtn.click();
                }
            });
        }
    }
    
    async function addImageFromFile(file) {
        // Show loading state
        const loadingId = `loading-${Date.now()}`;
        const container = document.getElementById('images-preview-container');
        
        if (container) {
            container.innerHTML += `
                <div id="${loadingId}" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#27271b] rounded-lg border border-slate-200 dark:border-[#393928]">
                    <div class="w-16 h-16 rounded-lg bg-slate-100 dark:bg-[#1f1f14] flex items-center justify-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                    <div class="flex-1">
                        <p class="text-slate-900 dark:text-white text-sm font-medium">Uploading ${file.name}...</p>
                        <p class="text-slate-500 dark:text-slate-600 text-xs">Uploading to Cloudinary...</p>
                    </div>
                </div>
            `;
        }
        
        try {
            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('Please select an image file');
            }
            
            // Ensure Cloudinary is initialized
            if (!window.cloudinaryService) {
                throw new Error('Cloudinary service not available. Please check configuration.');
            }
            
            // Get user ID (use a default if not authenticated)
            const userId = 'admin_product_' + Date.now();
            
            // Upload to Cloudinary
            const imageUrl = await window.cloudinaryService.uploadProductImage(
                file,
                userId,
                (progress) => {
                    console.log('Upload progress:', progress + '%');
                }
            );
            
            // Remove loading indicator
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) {
                loadingEl.remove();
            }
            
            // Add image to list
            addImage(imageUrl, file.name);
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Remove loading indicator
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) {
                loadingEl.remove();
            }
            
            alert('❌ Error uploading image: ' + error.message);
        }
    }
    
    function addImageFromUrl(url) {
        // Validate URL
        try {
            new URL(url);
            addImage(url, 'URL Image');
        } catch (e) {
            alert('Please enter a valid URL');
        }
    }
    
    function addImage(url, label) {
        productImages.push(url);
        renderImages();
    }
    
    function removeImage(index) {
        productImages.splice(index, 1);
        renderImages();
    }
    
    function renderImages() {
        const container = document.getElementById('images-preview-container');
        if (!container) return;
        
        if (productImages.length === 0) {
            container.innerHTML = '<p class="text-slate-400 dark:text-slate-600 text-sm">No images added yet</p>';
            return;
        }
        
        container.innerHTML = productImages.map((url, index) => `
            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#27271b] rounded-lg border border-slate-200 dark:border-[#393928]">
                <div class="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#1f1f14] flex-shrink-0">
                    <img src="${url}" alt="Product image ${index + 1}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'64\\' height=\\'64\\'%3E%3Crect fill=\\'%23ccc\\' width=\\'64\\' height=\\'64\\'/%3E%3Ctext fill=\\'%23999\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'10\\'%3EImage%3C/text%3E%3C/svg%3E'"/>
                    ${index === 0 ? '<span class="absolute top-1 left-1 bg-primary text-black text-xs font-bold px-1.5 py-0.5 rounded">Main</span>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-slate-900 dark:text-white text-sm font-medium truncate">${index === 0 ? 'Main Image' : `Image ${index + 1}`}</p>
                    <p class="text-slate-500 dark:text-slate-600 text-xs truncate">${url.length > 50 ? url.substring(0, 50) + '...' : url}</p>
                </div>
                <button type="button" onclick="window.productFormRemoveImage(${index})" class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove image">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        `).join('');
    }
    
    // Expose remove function globally
    window.productFormRemoveImage = function(index) {
        removeImage(index);
    };
    
    // Form submission handler
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const sectionSelect = document.getElementById('product-section');
            const brandSelect = document.getElementById('product-brand');
            const lineSelect = document.getElementById('product-line');
            const newLineInput = document.getElementById('new-line-name');
            
                const productNameInput = document.getElementById('product-name');
                
                // Get images - first image is main, rest are additional
                const mainImageUrl = productImages.length > 0 ? productImages[0] : '';
                const additionalImages = productImages.slice(1);
                
                const productData = {
                    name: productNameInput?.value.trim() || '',
                    section: sectionSelect?.value || '',
                    brand: brandSelect?.value || '',
                    line: lineSelect?.value || newLineInput?.value.trim() || '',
                    isNewLine: !lineSelect?.value && newLineInput?.value,
                    description: formData.get('description') || '',
                    flavorProfile: formData.get('flavor-profile') || '',
                    imageUrl: mainImageUrl,
                    images: productImages // Store all images
                };
                
                // Validate
                if (!productData.name || !productData.section || !productData.brand || !productData.line) {
                    alert('Please fill in all required fields: Product Name, Section, Brand, and Line.');
                    return;
                }
                
                // Warn if no images
                if (productImages.length === 0) {
                    const proceed = confirm('No images added. Continue without images?');
                    if (!proceed) return;
                }
            
            // Save to Firebase
            try {
                let brandName = productData.brand;
                
                // If creating new brand, save it first
                if (brandName === '__NEW__') {
                    const newBrandName = document.getElementById('new-brand-name')?.value.trim();
                    const newBrandLogo = document.getElementById('new-brand-logo')?.value.trim();
                    const newBrandWebsite = document.getElementById('new-brand-website')?.value.trim();
                    
                    if (!newBrandName) {
                        alert('Please enter a brand name.');
                        return;
                    }
                    
                    // Check if brand already exists
                    const existingBrand = await catalogService.getBrandByName(newBrandName);
                    if (existingBrand) {
                        const useExisting = confirm(`Brand "${newBrandName}" already exists. Use existing brand?`);
                        if (!useExisting) {
                            return;
                        }
                        brandName = newBrandName;
                    } else {
                        // Create new brand
                        const newBrandData = {
                            name: newBrandName,
                            logo_url: newBrandLogo || '',
                            website: newBrandWebsite || '',
                            lines: []
                        };
                        
                        await catalogService.saveBrand(productData.section, newBrandData);
                        brandName = newBrandName;
                        alert(`✅ Brand "${newBrandName}" created successfully!`);
                    }
                }
                
                if (!productData.section || !brandName || !productData.line || !productData.name) {
                    alert('Please fill in all required fields: Section, Brand, Line, and Product Name.');
                    return;
                }
                
                // Ensure the line exists first (create it if it doesn't exist)
                const brand = await catalogService.getBrandByNameInSection(productData.section, brandName);
                if (!brand) {
                    alert('Brand not found. Please create the brand first.');
                    return;
                }
                
                const lines = brand.lines || [];
                let lineExists = lines.find(l => l.name === productData.line);
                
                if (!lineExists) {
                    // Create the line if it doesn't exist
                    const newLineData = {
                        name: productData.line,
                        image_url: productImages.length > 0 ? productImages[0] : ''
                    };
                    await catalogService.saveProductLine(productData.section, brandName, newLineData);
                }
                
                // Prepare product data
                const productToSave = {
                    name: productData.name,
                    description: productData.description || '',
                    flavorProfile: productData.flavorProfile || '',
                    imageUrl: productImages.length > 0 ? productImages[0] : '',
                    images: productImages // All images (can contain multiple)
                };
                
                // Show loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Saving...';
                
                await catalogService.saveProduct(productData.section, brandName, productData.line, productToSave);
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                alert('✅ Product saved successfully to Firebase!');
                
                // Reset or redirect
                const addAnother = confirm('Product saved! Add another product?');
                if (addAnother) {
                    form.reset();
                    productImages = [];
                    renderImages();
                    document.getElementById('product-section').value = '';
                    document.getElementById('product-brand').innerHTML = '<option value="">Select Section First</option>';
                    document.getElementById('product-brand').disabled = true;
                    document.getElementById('product-line').innerHTML = '<option value="">Select Brand First</option>';
                    document.getElementById('product-line').disabled = true;
                    hideNewBrandForm();
                } else {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error saving product:', error);
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Save Product';
                alert('❌ Error saving product: ' + error.message);
            }
        });
    }
})();

