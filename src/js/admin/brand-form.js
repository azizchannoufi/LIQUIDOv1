/**
 * Brand Form Handler
 * Manages the brand addition/editing form with catalog integration
 */

(async function () {
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
    let selectedSections = new Set();

    // Initialize form
    document.addEventListener('DOMContentLoaded', async () => {
        await initForm();
    });

    async function initForm() {
        // Primary section handler
        const primarySectionSelect = document.getElementById('primary-section');
        if (primarySectionSelect) {
            primarySectionSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value) {
                    selectedSections.clear();
                    selectedSections.add(value);
                    updateSelectedSectionsDisplay();
                    // Disable selected option in add-section dropdown
                    updateAddSectionOptions();
                }
            });
        }

        // Add section handler
        const addSectionSelect = document.getElementById('add-section');
        if (addSectionSelect) {
            addSectionSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value && !selectedSections.has(value)) {
                    selectedSections.add(value);
                    updateSelectedSectionsDisplay();
                    updateAddSectionOptions();
                    e.target.value = '';
                }
            });
        }

        // Add product line button
        const addLineBtn = document.getElementById('add-line-btn');
        if (addLineBtn) {
            addLineBtn.addEventListener('click', addProductLine);
        }

        // Load existing sections if editing
        await loadExistingData();
    }

    function updateSelectedSectionsDisplay() {
        const container = document.getElementById('selected-sections');
        if (!container) return;

        container.innerHTML = '';

        selectedSections.forEach(sectionId => {
            const sectionName = sectionId === 'cat_liquidi' ? 'Liquidi' : 'Dispositivi';
            const tag = document.createElement('div');
            tag.className = 'flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full text-black text-sm font-bold';
            tag.innerHTML = `
                ${sectionName}
                <button type="button" class="remove-section-btn hover:bg-black/10 rounded-full flex items-center" data-section="${sectionId}">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            `;

            const removeBtn = tag.querySelector('.remove-section-btn');
            removeBtn.addEventListener('click', () => {
                selectedSections.delete(sectionId);
                updateSelectedSectionsDisplay();
                updateAddSectionOptions();

                // Clear primary section if it was removed
                const primarySelect = document.getElementById('primary-section');
                if (primarySelect && primarySelect.value === sectionId) {
                    primarySelect.value = '';
                }
            });

            container.appendChild(tag);
        });
    }

    function updateAddSectionOptions() {
        const addSectionSelect = document.getElementById('add-section');
        if (!addSectionSelect) return;

        Array.from(addSectionSelect.options).forEach(option => {
            if (option.value) {
                option.disabled = selectedSections.has(option.value);
            }
        });
    }

    function addProductLine() {
        const container = document.getElementById('product-lines-container');
        if (!container) return;

        const lineIndex = container.children.length;
        const lineDiv = document.createElement('div');
        lineDiv.className = 'flex flex-col gap-4 p-4 bg-background-dark/30 rounded-lg border border-border-dark';
        lineDiv.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <label class="text-white text-sm font-semibold mb-2 block">Line Name *</label>
                    <input type="text" 
                           name="lines[${lineIndex}][name]" 
                           class="form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/50 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm" 
                           placeholder="e.g. RE-BRAND, FLAVOURBAR" 
                           required/>
                </div>
                <div class="flex items-end">
                    <button type="button" class="remove-line-btn px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-bold border border-red-500/30">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
            
            <div class="flex flex-col gap-4 mt-2">
                <div class="flex justify-between items-center">
                    <p class="text-white text-sm font-semibold">Line Images</p>
                    <button type="button" class="add-image-btn px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-xs font-bold border border-primary/30 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">add_photo_alternate</span>
                        Add Image
                    </button>
                </div>
                <div class="line-images-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="line-images-container-${lineIndex}">
                </div>
            </div>
        `;

        const removeBtn = lineDiv.querySelector('.remove-line-btn');
        removeBtn.addEventListener('click', () => {
            lineDiv.remove();
        });

        const addImageBtn = lineDiv.querySelector('.add-image-btn');
        const imagesContainer = lineDiv.querySelector(`#line-images-container-${lineIndex}`);

        addImageBtn.addEventListener('click', () => {
            addLineImage(lineIndex, imagesContainer);
        });

        // Add an initial empty image by default
        addLineImage(lineIndex, imagesContainer);

        container.appendChild(lineDiv);
    }

    function addLineImage(lineIndex, container, imageUrl = '') {
        const MathRandomStr = Math.floor(Math.random() * 1000000).toString(16);
        const imageIndex = Date.now().toString(16) + '-' + MathRandomStr;
        const imgDiv = document.createElement('div');
        imgDiv.className = 'flex flex-col gap-4 p-4 bg-background-dark/50 rounded-lg border border-border-dark relative';

        imgDiv.innerHTML = `
            <button type="button" class="remove-image-btn absolute top-2 right-2 size-6 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-full flex items-center justify-center transition-all z-10" title="Remove image">
                <span class="material-symbols-outlined text-xs">close</span>
            </button>
            <div class="flex flex-col items-center gap-4 w-full mt-2">
                <div class="w-full aspect-square rounded-xl bg-background-dark border-2 border-dashed border-border-dark flex items-center justify-center overflow-hidden group relative" id="line-preview-${lineIndex}-${imageIndex}">
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <span class="material-symbols-outlined text-white text-3xl">edit</span>
                    </div>
                    <img id="line-preview-img-${lineIndex}-${imageIndex}" class="w-full h-full object-contain ${imageUrl ? '' : 'hidden'}" src="${imageUrl}" alt="Preview"/>
                    <span class="text-muted-dark text-sm ${imageUrl ? 'hidden' : ''}">No image</span>
                </div>
            </div>
            <div class="w-full">
                <input type="text" 
                       name="lines[${lineIndex}][images][]" 
                       id="line-image-url-${lineIndex}-${imageIndex}"
                       class="line-image-url-input form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/80 focus:border-primary focus:ring-1 focus:ring-primary h-8 px-2 text-xs mb-2" 
                       placeholder="Image URL" value="${imageUrl}"/>
                <div class="w-full border-2 border-dashed border-border-dark rounded-lg p-2 flex flex-col items-center justify-center bg-background-dark/20 hover:bg-background-dark/40 hover:border-primary/50 transition-all cursor-pointer">
                    <input type="file" id="line-upload-${lineIndex}-${imageIndex}" accept="image/*" class="hidden"/>
                    <label for="line-upload-${lineIndex}-${imageIndex}" class="cursor-pointer text-center w-full">
                        <span class="material-symbols-outlined text-xl text-muted-dark mb-1 block">cloud_upload</span>
                        <p class="text-white text-xs font-medium">Upload File</p>
                    </label>
                </div>
            </div>
        `;

        const removeBtn = imgDiv.querySelector('.remove-image-btn');
        removeBtn.addEventListener('click', () => {
            imgDiv.remove();
        });

        const imageUrlInput = imgDiv.querySelector(`#line-image-url-${lineIndex}-${imageIndex}`);
        const imagePreview = imgDiv.querySelector(`#line-preview-img-${lineIndex}-${imageIndex}`);
        const previewContainer = imgDiv.querySelector(`#line-preview-${lineIndex}-${imageIndex}`);

        if (imageUrlInput && imagePreview) {
            imageUrlInput.addEventListener('input', (e) => {
                const url = e.target.value;
                if (url) {
                    imagePreview.src = url;
                    imagePreview.classList.remove('hidden');
                    previewContainer.querySelector('span').classList.add('hidden');
                } else {
                    imagePreview.classList.add('hidden');
                    previewContainer.querySelector('span').classList.remove('hidden');
                }
            });
        }

        const lineUpload = imgDiv.querySelector(`#line-upload-${lineIndex}-${imageIndex}`);
        if (lineUpload) {
            lineUpload.addEventListener('change', async function (e) {
                const file = e.target.files[0];
                if (!file) return;

                const uploadArea = lineUpload.closest('div');
                const originalContent = uploadArea?.innerHTML;
                if (uploadArea) {
                    uploadArea.innerHTML = '<div class="flex flex-col items-center gap-1 py-1"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div><p class="text-[10px] text-white">Uploading...</p></div>';
                }

                try {
                    if (!file.type.startsWith('image/')) throw new Error('Please select an image file');
                    if (!window.cloudinaryService) throw new Error('Cloudinary service not available.');

                    const userId = 'admin_line_' + Date.now();
                    const uploadedImageUrl = await window.cloudinaryService.uploadProductImage(
                        file, userId, () => { }
                    );

                    if (imagePreview) {
                        imagePreview.src = uploadedImageUrl;
                        imagePreview.classList.remove('hidden');
                        const noImageSpan = previewContainer.querySelector('span');
                        if (noImageSpan) noImageSpan.classList.add('hidden');
                    }
                    if (imageUrlInput) imageUrlInput.value = uploadedImageUrl;

                    if (uploadArea && originalContent) {
                        uploadArea.innerHTML = originalContent;
                        const newUpload = document.getElementById(`line-upload-${lineIndex}-${imageIndex}`);
                        if (newUpload) newUpload.addEventListener('change', arguments.callee);
                    }
                } catch (error) {
                    console.error('Error uploading line image:', error);
                    alert('❌ Error uploading line image: ' + error.message);
                    if (uploadArea && originalContent) {
                        uploadArea.innerHTML = originalContent;
                        const newUpload = document.getElementById(`line-upload-${lineIndex}-${imageIndex}`);
                        if (newUpload) newUpload.addEventListener('change', arguments.callee);
                    }
                }
            });
        }

        container.appendChild(imgDiv);
    }

    async function loadExistingData() {
        // Check if we're editing (URL params)
        const urlParams = new URLSearchParams(window.location.search);
        const brandName = urlParams.get('brand');
        const sectionId = urlParams.get('section');

        if (brandName && sectionId) {
            try {
                // Load existing brand data
                const brand = await catalogService.getBrandByNameInSection(sectionId, brandName);
                if (brand) {
                    // Populate form
                    document.getElementById('brand-name').value = brand.name || '';
                    document.getElementById('brand-type').value = brand.type || '';
                    document.getElementById('website').value = brand.website || '';
                    document.getElementById('description').value = brand.description || '';
                    document.getElementById('logo-url').value = brand.logo_url || '';

                    // Update logo preview
                    const logoPreview = document.getElementById('logo-preview-img');
                    if (logoPreview && brand.logo_url) {
                        logoPreview.src = brand.logo_url;
                        logoPreview.classList.remove('hidden');
                        logoPreview.parentElement.querySelector('span').classList.add('hidden');
                    }

                    // Set primary section
                    const primarySection = document.getElementById('primary-section');
                    if (primarySection) {
                        primarySection.value = sectionId;
                        selectedSections.clear();
                        selectedSections.add(sectionId);
                        updateSelectedSectionsDisplay();
                        updateAddSectionOptions();
                    }

                    // Load product lines or products based on type
                    const container = document.getElementById('product-lines-container');
                    if (brand.type === 'device' && brand.products && brand.products.length > 0) {
                        // For devices, load products (simpler structure)
                        brand.products.forEach((product, index) => {
                            const lineDiv = document.createElement('div');
                            lineDiv.className = 'flex flex-col gap-4 p-4 bg-background-dark/30 rounded-lg border border-border-dark';
                            lineDiv.innerHTML = `
                                <div class="flex flex-col md:flex-row gap-4">
                                    <div class="flex-1">
                                        <label class="text-white text-sm font-semibold mb-2 block">Product Name *</label>
                                        <input type="text" 
                                               name="lines[${index}][name]" 
                                               class="form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/50 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm" 
                                               placeholder="e.g. PEAK 2, WENAX M" 
                                               value="${product.name || ''}"
                                               required/>
                                    </div>
                                    <div class="flex items-end">
                                        <button type="button" class="remove-line-btn px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-bold border border-red-500/30">
                                            <span class="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            `;

                            const removeBtn = lineDiv.querySelector('.remove-line-btn');
                            removeBtn.addEventListener('click', () => {
                                lineDiv.remove();
                            });

                            container.appendChild(lineDiv);
                        });
                    } else if (brand.lines && brand.lines.length > 0) {
                        // For liquids, load lines with images
                        brand.lines.forEach((line, index) => {
                            const lineDiv = document.createElement('div');
                            lineDiv.className = 'flex flex-col gap-4 p-4 bg-background-dark/30 rounded-lg border border-border-dark';

                            lineDiv.innerHTML = `
                                <div class="flex flex-col md:flex-row gap-4">
                                    <div class="flex-1">
                                        <label class="text-white text-sm font-semibold mb-2 block">Line Name *</label>
                                        <input type="text" 
                                               name="lines[${index}][name]" 
                                               class="form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/50 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm" 
                                               placeholder="e.g. RE-BRAND, FLAVOURBAR" 
                                               value="${line.name || ''}"
                                               required/>
                                    </div>
                                    <div class="flex items-end">
                                        <button type="button" class="remove-line-btn px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-bold border border-red-500/30">
                                            <span class="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-4 mt-2">
                                    <div class="flex justify-between items-center">
                                        <p class="text-white text-sm font-semibold">Line Images</p>
                                        <button type="button" class="add-image-btn px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-xs font-bold border border-primary/30 flex items-center gap-2">
                                            <span class="material-symbols-outlined text-sm">add_photo_alternate</span>
                                            Add Image
                                        </button>
                                    </div>
                                    <div class="line-images-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="line-images-container-${index}">
                                    </div>
                                </div>
                            `;

                            const removeBtn = lineDiv.querySelector('.remove-line-btn');
                            removeBtn.addEventListener('click', () => {
                                lineDiv.remove();
                            });

                            const addImageBtn = lineDiv.querySelector('.add-image-btn');
                            const imagesContainer = lineDiv.querySelector(`#line-images-container-${index}`);

                            addImageBtn.addEventListener('click', () => {
                                addLineImage(index, imagesContainer);
                            });

                            // Load existing images
                            const imagesToLoad = line.images && line.images.length > 0
                                ? line.images
                                : (line.image_url ? [line.image_url] : []);

                            if (imagesToLoad.length > 0) {
                                imagesToLoad.forEach(imgUrl => addLineImage(index, imagesContainer, imgUrl));
                            } else {
                                addLineImage(index, imagesContainer); // default empty
                            }

                            container.appendChild(lineDiv);
                        });
                    }

                    // Update page title
                    const pageTitle = document.getElementById('page-title');
                    const breadcrumb = document.getElementById('breadcrumb-text');
                    if (pageTitle) pageTitle.textContent = `Edit Brand: ${brand.name}`;
                    if (breadcrumb) breadcrumb.textContent = `Edit Brand`;
                }
            } catch (error) {
                console.error('Error loading brand data:', error);
            }
        }
    }

    // Logo URL preview handler
    const logoUrlInput = document.getElementById('logo-url');
    const logoPreview = document.getElementById('logo-preview-img');
    if (logoUrlInput && logoPreview) {
        logoUrlInput.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url) {
                logoPreview.src = url;
                logoPreview.classList.remove('hidden');
                logoPreview.parentElement.querySelector('span').classList.add('hidden');
            } else {
                logoPreview.classList.add('hidden');
                logoPreview.parentElement.querySelector('span').classList.remove('hidden');
            }
        });
    }

    // Logo upload handler with Cloudinary
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading state
            const uploadArea = logoUpload.closest('div');
            const originalContent = uploadArea?.innerHTML;
            if (uploadArea) {
                uploadArea.innerHTML = '<div class="flex flex-col items-center gap-2"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p class="text-sm text-white">Uploading...</p></div>';
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
                const userId = 'admin_brand_' + Date.now();

                // Upload to Cloudinary
                const imageUrl = await window.cloudinaryService.uploadProductImage(
                    file,
                    userId,
                    (progress) => {
                        // Update progress if needed
                        console.log('Upload progress:', progress + '%');
                    }
                );

                // Update preview and URL input
                if (logoPreview) {
                    logoPreview.src = imageUrl;
                    logoPreview.classList.remove('hidden');
                    const noLogoSpan = logoPreview.parentElement.querySelector('span');
                    if (noLogoSpan) noLogoSpan.classList.add('hidden');
                }

                if (logoUrlInput) {
                    logoUrlInput.value = imageUrl;
                }

                // Restore upload area
                if (uploadArea && originalContent) {
                    uploadArea.innerHTML = originalContent;
                    // Re-attach event listener
                    const newUpload = document.getElementById('logo-upload');
                    if (newUpload) {
                        newUpload.addEventListener('change', arguments.callee);
                    }
                }

                alert('✅ Logo uploaded successfully to Cloudinary!');
            } catch (error) {
                console.error('Error uploading logo:', error);
                alert('❌ Error uploading logo: ' + error.message);

                // Restore upload area
                if (uploadArea && originalContent) {
                    uploadArea.innerHTML = originalContent;
                    const newUpload = document.getElementById('logo-upload');
                    if (newUpload) {
                        newUpload.addEventListener('change', arguments.callee);
                    }
                }
            }
        });
    }

    // Form submission handler
    const form = document.getElementById('brand-form') || document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const brandNameInput = document.getElementById('brand-name');
            const brandTypeInput = document.getElementById('brand-type');
            const websiteInput = document.getElementById('website');
            const descriptionInput = document.getElementById('description');
            const logoUrlInput = document.getElementById('logo-url');


            const brandData = {
                name: brandNameInput?.value.trim() || '',
                type: brandTypeInput?.value.trim() || '',
                website: websiteInput?.value.trim() || '',
                description: descriptionInput?.value.trim() || '',
                logo_url: logoUrlInput?.value.trim() || ''
                // Note: lines or products will be added later based on type
            };

            // Collect product lines
            const lineInputs = document.querySelectorAll('input[name^="lines["]');
            const linesMap = new Map();

            lineInputs.forEach((input) => {
                const matchName = input.name.match(/lines\[(\d+)\]\[name\]/);
                const matchImageUrl = input.name.match(/lines\[(\d+)\]\[image_url\]/);
                const matchImages = input.name.match(/lines\[(\d+)\]\[images\]\[\]/);

                if (matchName) {
                    const lineIndex = parseInt(matchName[1]);
                    if (!linesMap.has(lineIndex)) linesMap.set(lineIndex, { images: [] });
                    linesMap.get(lineIndex).name = input.value.trim();
                } else if (matchImageUrl) {
                    const lineIndex = parseInt(matchImageUrl[1]);
                    if (!linesMap.has(lineIndex)) linesMap.set(lineIndex, { images: [] });
                    const val = input.value.trim();
                    if (val) linesMap.get(lineIndex).image_url = val;
                } else if (matchImages) {
                    const lineIndex = parseInt(matchImages[1]);
                    if (!linesMap.has(lineIndex)) linesMap.set(lineIndex, { images: [] });
                    const val = input.value.trim();
                    if (val) linesMap.get(lineIndex).images.push(val);
                }
            });

            const collectedLines = Array.from(linesMap.values()).map(line => {
                if (line.images && line.images.length > 0) {
                    line.image_url = line.images[0]; // For backwards compatibility
                } else if (line.image_url) {
                    line.images = [line.image_url];
                }
                return line;
            }).filter(line => line.name && line.name.trim() !== '');

            // For device type, use products array; for liquid type, use lines array
            // IMPORTANT: Delete the unused property instead of setting it to undefined
            // Firebase doesn't accept undefined values
            if (brandData.type === 'device') {
                brandData.products = collectedLines;
                delete brandData.lines; // Remove lines property for devices
            } else {
                brandData.lines = collectedLines;
                delete brandData.products; // Remove products property for liquids
            }

            // Validate
            if (!brandData.name || !brandData.type || selectedSections.size === 0) {
                alert('Please fill in the brand name, select a type, and select at least one section.');
                return;
            }

            // Clean up undefined values before saving to Firebase
            // Firebase doesn't accept undefined values
            const cleanBrandData = Object.fromEntries(
                Object.entries(brandData).filter(([_, v]) => v !== undefined)
            );

            console.log('📤 Cleaned brand data for Firebase:', cleanBrandData);

            // Save to Firebase
            try {
                if (selectedSections.size === 0) {
                    alert('Please select at least one section.');
                    return;
                }

                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Saving...';

                // Save brand to each selected section
                const savePromises = Array.from(selectedSections).map(sectionId =>
                    catalogService.saveBrand(sectionId, cleanBrandData)
                );

                await Promise.all(savePromises);

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                alert('✅ Brand saved successfully to Firebase!');

                // Reset form or redirect
                const confirmRedirect = confirm('Brand saved! Do you want to add another brand?');
                if (confirmRedirect) {
                    form.reset();
                    selectedSections.clear();
                    updateSelectedSectionsDisplay();
                    document.getElementById('product-lines-container').innerHTML = '';
                } else {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error saving brand:', error);
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">save</span> Save Brand';
                alert('❌ Error saving brand: ' + error.message);
            }
        });
    }
})();

