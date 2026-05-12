/* ================================================
   profile.js  –  Owner profile logic
   ================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const auth = await import("/js/core/auth.js");
    try {
        auth.requireAuth();
        auth.requireRole("OWNER");
    } catch {
        return;
    }

    const $ = (id) => document.getElementById(id);
    let editing = false;

    function applyProfilePhoto(url) {
        const img = $("profile-avatar-preview");
        const fb = $("profile-avatar-fallback");
        if (!img || !fb) return;
        if (url) {
            img.src = url;
            img.removeAttribute("hidden");
            fb.setAttribute("hidden", "");
        } else {
            img.setAttribute("hidden", "");
            fb.removeAttribute("hidden");
        }
    }

    try {
        const profileData = await AppointmentService.fetchData("/api/user/me");
        const fName = $("f-name");
        const fEmail = $("f-email");
        const cardName = $("card-name");
        
        if (fName && profileData.name) fName.value = profileData.name;
        if (cardName && profileData.name) cardName.textContent = profileData.name;
        if (fEmail && profileData.email) fEmail.value = profileData.email;
        
        applyProfilePhoto(profileData.profileImageUrl);
    } catch (e) {
        console.error("Failed to load profile", e);
    }

    const btnEdit = $("btn-edit");
    const fNameInput = $("f-name");

    btnEdit?.addEventListener("click", async () => {
        if (editing) {
            const dto = {};
            if (fNameInput) dto.name = fNameInput.value;

            try {
                const res = await fetch("/api/user/me", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify(dto)
                });
                if (!res.ok) throw new Error("Failed to save profile");
                const updated = await res.json();
                
                showToast("Profile updated successfully");
                
                if ($("card-name")) $("card-name").textContent = updated.name;
                
                editing = false;
                btnEdit.innerHTML = '<i class="ph-bold ph-pencil"></i> Edit Profile';
                btnEdit.classList.remove("active");
                if (fNameInput) fNameInput.readOnly = true;

                if (typeof window.initSmartClinicNavbar === "function") {
                    await window.initSmartClinicNavbar();
                }
            } catch (err) {
                showToast("Failed to save profile.", true);
            }
        } else {
            editing = true;
            btnEdit.innerHTML = '<i class="ph-bold ph-check"></i> Save Changes';
            btnEdit.classList.add("active");
            if (fNameInput) fNameInput.readOnly = false;
            fNameInput?.focus();
        }
    });

    const photoInput = $("profile-photo-input");
    const photoBtn = $("profile-photo-btn");
    const photoDelBtn = $("profile-photo-del-btn");

    photoBtn?.addEventListener("click", () => photoInput?.click());

    photoInput?.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/user/me/photo", {
                method: "POST",
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
                body: formData
            });
            if (!res.ok) throw new Error("Failed to upload");
            const updated = await res.json();
            applyProfilePhoto(updated.profileImageUrl);
            showToast("Profile photo updated.");
            
            if (typeof window.initSmartClinicNavbar === "function") {
                await window.initSmartClinicNavbar();
            }
        } catch (err) {
            showToast("Failed to upload photo.", true);
        }
        photoInput.value = "";
    });

    photoDelBtn?.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to remove your profile photo?")) return;
        try {
            const res = await fetch("/api/user/me/photo", {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            });
            if (!res.ok) throw new Error("Failed to delete");
            applyProfilePhoto(null);
            showToast("Profile photo removed.");
            
            if (typeof window.initSmartClinicNavbar === "function") {
                await window.initSmartClinicNavbar();
            }
        } catch (err) {
            showToast("Failed to delete photo.", true);
        }
    });

    function showToast(msg, isError = false) {
        const t = $("toast");
        const tm = $("toast-msg");
        if (!t || !tm) return;
        tm.textContent = msg;
        t.style.background = isError ? "var(--red-600)" : "var(--green-600)";
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 3000);
    }
});
