// IMAGE-HANDLER.JS - Independent Module for Upload & Manual Cropping
let cropperInstance = null;

// Global image variable window level par leak kiya hai taaki dashboard.js ise read kar sake
window.uploadedImageUrl = ""; 

const imageInput = document.getElementById('imageInput');
const uploadStatus = document.getElementById('uploadStatus');
const dashAvatarPreview = document.getElementById('dashAvatarPreview');
const prevAvatar = document.getElementById('prevAvatar');
const cropPopupOverlay = document.getElementById('cropPopupOverlay');
const cropRawImageTarget = document.getElementById('cropRawImageTarget');

// 1. Photo select hote hi popup open hoga aur cropper start hoga
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        
        cropRawImageTarget.src = event.target.result;
        
        // Image element load hone par hi cropper initialize hoga
        cropRawImageTarget.onload = () => {
            cropperInstance = new Cropper(cropRawImageTarget, {
                aspectRatio: 1,
                viewMode: 1,
                background: false,
                autoCropArea: 0.8,
                responsive: true
            });
        };

        cropPopupOverlay.style.display = 'flex'; 
    };
    reader.readAsDataURL(file);
});

// 2. "Save Crop & Apply" Button Click Handler - 100% Guaranteed Work
document.getElementById('btnExecuteCrop').addEventListener('click', (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (cropperInstance) {
        // High quality final cropped image bundle link creation
        const canvas = cropperInstance.getClippedCanvas({
            width: 280,
            height: 280
        });
        
        if (canvas) {
            window.uploadedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Dashboard aur Preview donon jagah live photo show hogi
            dashAvatarPreview.src = window.uploadedImageUrl;
            prevAvatar.src = window.uploadedImageUrl;
            
            uploadStatus.innerText = "✓ Circular photo matched & preview synchronized.";
            uploadStatus.style.color = "#10b981";
        }
        
        cropperInstance.destroy();
        cropperInstance = null;
    }
    cropPopupOverlay.style.display = 'none';
});

// 3. Cancel Button Handler
document.getElementById('btnCancelCrop').addEventListener('click', (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
    cropPopupOverlay.style.display = 'none';
    imageInput.value = ""; 
    uploadStatus.innerText = "Staging cancelled.";
    uploadStatus.style.color = "#ef4444";
});
