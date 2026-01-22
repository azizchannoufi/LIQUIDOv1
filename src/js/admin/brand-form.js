/**
 * Brand Form Handler
 * Manages the brand addition/editing form with catalog integration
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
        lineDiv.className = 'flex flex-col md:flex-row gap-4 p-4 bg-background-dark/30 rounded-lg border border-border-dark';
        lineDiv.innerHTML = `
            <div class="flex-1">
                <label class="text-white text-sm font-semibold mb-2 block">Line Name *</label>
                <input type="text" 
                       name="lines[${lineIndex}][name]" 
                       class="form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/50 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm" 
                       placeholder="e.g. RE-BRAND, FLAVOURBAR" 
                       required/>
            </div>
            <div class="flex-1">
                <label class="text-white text-sm font-semibold mb-2 block">Image URL</label>
                <input type="text" 
                       name="lines[${lineIndex}][image_url]" 
                       class="form-input w-full rounded-lg text-white border border-border-dark bg-background-dark/50 focus:border-primary focus:ring-1 focus:ring-primary h-10 px-3 text-sm" 
                       placeholder="/images/products/brand/line.jpg"/>
            </div>
            <div class="flex items-end">
                <button type="button" class="remove-line-btn px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm font-bold border border-red-500/30">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        `;
        
        const removeBtn = lineDiv.querySelector('.remove-line-btn');
        removeBtn.addEventListener('click', () => {
            lineDiv.remove();
        });
        
        container.appendChild(lineDiv);
    }
    
    async function loadExistingData() {
        // Check if we're editing (URL params or form data)
        const urlParams = new URLSearchParams(window.location.search);
        const brandId = urlParams.get('id');
        
        if (brandId) {
            // Load existing brand data
            // This would typically come from an API
            // For now, we'll just ensure the form is ready
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
    
    // Logo upload handler
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // In a real app, you would upload to a server
                // For now, we'll create a local preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (logoPreview) {
                        logoPreview.src = event.target.result;
                        logoPreview.classList.remove('hidden');
                        logoPreview.parentElement.querySelector('span').classList.add('hidden');
                    }
                    // Set the URL input (in real app, this would be the uploaded URL)
                    if (logoUrlInput) {
                        logoUrlInput.value = `/images/brands/${file.name}`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submission handler
    const form = document.getElementById('brand-form') || document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const brandNameInput = document.getElementById('brand-name');
            const websiteInput = document.getElementById('website');
            const descriptionInput = document.getElementById('description');
            const logoUrlInput = document.getElementById('logo-url');
            
            const brandData = {
                name: brandNameInput?.value.trim() || '',
                website: websiteInput?.value.trim() || '',
                description: descriptionInput?.value.trim() || '',
                logo_url: logoUrlInput?.value.trim() || '',
                lines: []
            };
            
            // Collect product lines
            const lineInputs = document.querySelectorAll('input[name^="lines["]');
            const linesMap = new Map();
            
            lineInputs.forEach((input) => {
                const match = input.name.match(/lines\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const lineIndex = parseInt(match[1]);
                    const field = match[2];
                    
                    if (!linesMap.has(lineIndex)) {
                        linesMap.set(lineIndex, {});
                    }
                    const line = linesMap.get(lineIndex);
                    line[field] = input.value.trim();
                }
            });
            
            brandData.lines = Array.from(linesMap.values()).filter(line => line.name && line.name.trim() !== '');
            
            // Validate
            if (!brandData.name || selectedSections.size === 0) {
                alert('Please fill in the brand name and select at least one section.');
                return;
            }
            
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
                    catalogService.saveBrand(sectionId, brandData)
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

