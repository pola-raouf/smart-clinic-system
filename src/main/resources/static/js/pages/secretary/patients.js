/* Secretary – patient CRUD */

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("sec-patients-app");
    const token = localStorage.getItem("token");

    const api = (path, opts = {}) =>
        fetch(path, {
            ...opts,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
                ...(opts.headers || {}),
            },
        });

    function escapeHtml(s) {
        const d = document.createElement("div");
        d.textContent = s == null ? "" : String(s);
        return d.innerHTML;
    }

    function render(list, editingId) {
        const rows = (list || [])
            .map(
                (p) => `
          <tr data-id="${p.id}">
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.email)}</td>
            <td>${escapeHtml(p.phoneNumber || "—")}</td>
            <td>${escapeHtml(p.gender || "—")}</td>
            <td>${escapeHtml(p.dateOfBirth || "—")}</td>
            <td>
              <button type="button" class="btn-sec-edit" data-id="${p.id}">Edit</button>
              <button type="button" class="btn-sec-del" data-id="${p.id}">Delete</button>
            </td>
          </tr>`
            )
            .join("");

        app.innerHTML = `
          <div class="page-header" style="margin-bottom:1rem;">
            <h2 style="margin:0;">${editingId ? "Edit patient #" + editingId : "Register new patient"}</h2>
          </div>
          <form id="sec-patient-form" class="booking-card" style="margin-bottom:1.5rem;">
            <input type="hidden" name="editId" value="${editingId || ""}">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.75rem;">
              <label>Full name<br><input name="name" required style="width:100%;"></label>
              <label>Email<br><input name="email" type="email" required style="width:100%;"></label>
              <label>Password ${editingId ? "(optional)" : ""}<br><input name="password" type="password" ${editingId ? "" : "required minlength='8'"} style="width:100%;"></label>
              <label>Phone<br><input name="phoneNumber" required style="width:100%;"></label>
              <label>Date of birth<br><input name="dateOfBirth" type="date" required style="width:100%;"></label>
              <label>Gender<br>
                <select name="gender" required style="width:100%;">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </label>
              <label style="grid-column:1/-1;">Address<br><input name="address" type="text" style="width:100%;"></label>
            </div>
            <div style="margin-top:0.75rem;display:flex;gap:0.5rem;">
              <button type="submit" class="btn-register">${editingId ? "Save changes" : "Create patient"}</button>
              ${editingId ? '<button type="button" id="btn-cancel-edit" class="btn-keep">Cancel</button>' : ""}
            </div>
            <p id="sec-patient-msg" style="margin-top:0.5rem;color:#b91c1c;"></p>
          </form>
          <div class="booking-card">
            <h3 style="margin-top:0;">Patients</h3>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:0.35rem;">Name</th>
                    <th style="text-align:left;padding:0.35rem;">Email</th>
                    <th style="text-align:left;padding:0.35rem;">Phone</th>
                    <th style="text-align:left;padding:0.35rem;">Gender</th>
                    <th style="text-align:left;padding:0.35rem;">DOB</th>
                    <th style="text-align:left;padding:0.35rem;">Actions</th>
                  </tr>
                </thead>
                <tbody>${rows || "<tr><td colspan='6'>No patients</td></tr>"}</tbody>
              </table>
            </div>
          </div>`;

        const form = app.querySelector("#sec-patient-form");
        if (editingId) {
            const cur = (list || []).find((x) => String(x.id) === String(editingId));
            if (cur) {
                form.name.value = cur.name || "";
                form.email.value = cur.email || "";
                form.phoneNumber.value = cur.phoneNumber || "";
                form.dateOfBirth.value = cur.dateOfBirth || "";
                form.gender.value = cur.gender === "FEMALE" ? "FEMALE" : "MALE";
                form.address.value = cur.address || "";
            }
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const msg = app.querySelector("#sec-patient-msg");
            msg.textContent = "";
            const fd = new FormData(form);
            const edit = fd.get("editId");

            try {
                if (edit) {
                    const patch = {
                        name: fd.get("name"),
                        email: fd.get("email"),
                        phoneNumber: fd.get("phoneNumber"),
                        dateOfBirth: fd.get("dateOfBirth"),
                        gender: fd.get("gender"),
                        address: fd.get("address") || "",
                    };
                    const pw = fd.get("password");
                    if (pw && String(pw).trim()) patch.password = pw;
                    const res = await api("/api/secretary/patients/" + edit, {
                        method: "PUT",
                        body: JSON.stringify(patch),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        msg.textContent = err.message || "Update failed";
                        return;
                    }
                } else {
                    const body = {
                        name: fd.get("name"),
                        email: fd.get("email"),
                        password: fd.get("password"),
                        phoneNumber: fd.get("phoneNumber"),
                        dateOfBirth: fd.get("dateOfBirth"),
                        gender: fd.get("gender"),
                        address: fd.get("address") || "",
                    };
                    const res = await api("/api/secretary/patients", {
                        method: "POST",
                        body: JSON.stringify(body),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        msg.textContent = err.message || "Create failed";
                        return;
                    }
                }
                await refresh(null);
            } catch (err) {
                msg.textContent = "Network error";
            }
        });

        app.querySelector("#btn-cancel-edit")?.addEventListener("click", () => {
            refresh(null);
        });

        app.querySelectorAll(".btn-sec-del").forEach((btn) => {
            btn.addEventListener("click", async () => {
                if (!confirm("Delete this patient account?")) return;
                const id = btn.getAttribute("data-id");
                const res = await api("/api/secretary/patients/" + id, { method: "DELETE" });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.message || "Delete failed");
                    return;
                }
                await refresh(null);
            });
        });

        app.querySelectorAll(".btn-sec-edit").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                refresh(id);
            });
        });
    }

    async function refresh(editId) {
        const res = await api("/api/secretary/patients");
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/pages/login.html";
            return;
        }
        if (!res.ok) {
            app.textContent = "Could not load patients.";
            return;
        }
        const list = await res.json();
        render(list, editId);
    }

    try {
        const { requireAuth, requireRole } = await import("/js/core/auth.js");
        requireAuth();
        requireRole("SECRETARY");
    } catch {
        return;
    }

    await refresh(null);
    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
});
