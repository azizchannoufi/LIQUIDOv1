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
    
    // Initialize form
    document.addEventListener('DOMContentLoaded', async () => {
        await initForm();
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
                            imageUrlInput.value = line.image_url || '';
                        }
                        
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
    
    async function loadExistingData() {
        // Check if we're editing (URL params)
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const brandParam = urlParams.get('brand');
        const sectionParam = urlParams.get('section');
        
        if (sectionParam) {
            const sectionSelect = document.getElementById('product-section');
            if (sectionSelect) {
                sectionSelect.value = sectionParam;
                sectionSelect.dispatchEvent(new Event('change'));
                
                // Wait for brands to load
                setTimeout(async () => {
                    if (brandParam) {
                        const brandSelect = document.getElementById('product-brand');
                        if (brandSelect) {
                            brandSelect.value = brandParam;
                            brandSelect.dispatchEvent(new Event('change'));
                        }
                    }
                }, 500);
            }
        }
    }
    
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
            const productData = {
                name: productNameInput?.value.trim() || '',
                section: sectionSelect?.value || '',
                brand: brandSelect?.value || '',
                line: lineSelect?.value || newLineInput?.value.trim() || '',
                isNewLine: !lineSelect?.value && newLineInput?.value,
                description: formData.get('description') || '',
                flavorProfile: formData.get('flavor-profile') || '',
                imageUrl: formData.get('image-url') || ''
            };
            
            // Validate
            if (!productData.name || !productData.section || !productData.brand || !productData.line) {
                alert('Please fill in all required fields: Product Name, Section, Brand, and Line.');
                return;
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
                
                if (!productData.section || !brandName || !productData.line) {
                    alert('Please fill in all required fields: Section, Brand, and Line.');
                    return;
                }
                
                const lineData = {
                    name: productData.line,
                    image_url: productData.imageUrl || ''
                };
                
                // Show loading
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Saving...';
                
                await catalogService.saveProductLine(productData.section, brandName, lineData);
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                alert('✅ Product line saved successfully to Firebase!');
                
                // Reset or redirect
                const addAnother = confirm('Product saved! Add another product?');
                if (addAnother) {
                    form.reset();
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

