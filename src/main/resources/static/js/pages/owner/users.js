/* Owner – user management (API-driven) */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { bootRoleShell } = await import("/js/core/page-boot.js");
        await bootRoleShell("OWNER");
    } catch {
        return;
    }

    const root = document.getElementById("owner-users-app");
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

    function displayLabel(u) {
        return (
            u.patientName ||
            u.doctorName ||
            u.secretaryName ||
            u.ownerName ||
            "—"
        );
    }

    function render(users) {
        const rows = (users || [])
            .map(
                (u) => `
            <tr data-id="${u.userId}">
              <td>${escapeHtml(u.userId)}</td>
              <td>${escapeHtml(u.email)}</td>
              <td>${escapeHtml(u.role)}</td>
              <td>${escapeHtml(displayLabel(u))}</td>
              <td>${escapeHtml(u.patientRecordId ?? "—")}</td>
              <td>${escapeHtml(u.patientName ?? "—")}</td>
              <td>${escapeHtml(u.gender ?? "—")}</td>
              <td>${escapeHtml(u.dateOfBirth ?? "—")}</td>
              <td>${escapeHtml(u.phoneNumber ?? "—")}</td>
              <td>${escapeHtml(u.address ?? "—")}</td>
              <td>${escapeHtml(u.doctorRecordId ?? "—")}</td>
              <td>${escapeHtml(u.doctorName ?? "—")}</td>
              <td>${escapeHtml(u.specialty ?? "—")}</td>
              <td>${escapeHtml(u.secretaryRecordId ?? "—")}</td>
              <td>${escapeHtml(u.secretaryName ?? "—")}</td>
              <td>${escapeHtml(u.ownerRecordId ?? "—")}</td>
              <td>${escapeHtml(u.ownerName ?? "—")}</td>
              <td>
                <button type="button" class="btn-edit-user" data-id="${u.userId}">Edit</button>
                <button type="button" class="btn-del-user" data-id="${u.userId}">Delete</button>
              </td>
            </tr>`
            )
            .join("");

        root.innerHTML = `
          <div class="dash-card" style="margin-bottom:1rem;">
            <h2 style="margin:0 0 0.75rem 0;">Add user</h2>
            <form id="form-create-user" style="display:grid;gap:0.5rem;max-width:32rem;">
              <label>Email<br><input name="email" type="email" required style="width:100%;"></label>
              <label>Password<br><input name="password" type="password" required minlength="8" style="width:100%;"></label>
              <label>Role<br>
                <select name="role" required style="width:100%;">
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="OWNER">Owner</option>
                </select>
              </label>
              <label>Name<br><input name="name" type="text" required style="width:100%;"></label>
              <div id="extra-patient" style="display:none;flex-direction:column;gap:0.5rem;">
                <label>Gender<br>
                  <select name="gender" style="width:100%;"><option value="MALE">Male</option><option value="FEMALE">Female</option></select>
                </label>
                <label>Date of birth<br><input name="dateOfBirth" type="date" style="width:100%;"></label>
                <label>Phone<br><input name="phoneNumber" type="tel" style="width:100%;"></label>
                <label>Address<br><input name="address" type="text" style="width:100%;"></label>
              </div>
              <div id="extra-doctor" style="display:none;">
                <label>Specialty<br><input name="specialty" type="text" style="width:100%;"></label>
              </div>
              <button type="submit" class="btn-register" style="max-width:12rem;">Create user</button>
            </form>
            <p id="create-msg" style="margin-top:0.5rem;color:#b91c1c;"></p>
          </div>
          <div class="dash-card">
            <h2 style="margin:0 0 0.75rem 0;">All users</h2>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                <thead><tr>
                  <th style="text-align:left;padding:0.35rem;">User ID</th>
                  <th style="text-align:left;padding:0.35rem;">Email</th>
                  <th style="text-align:left;padding:0.35rem;">Role</th>
                  <th style="text-align:left;padding:0.35rem;">Display name</th>
                  <th style="text-align:left;padding:0.35rem;">Patient ID</th>
                  <th style="text-align:left;padding:0.35rem;">Patient name</th>
                  <th style="text-align:left;padding:0.35rem;">Gender</th>
                  <th style="text-align:left;padding:0.35rem;">DOB</th>
                  <th style="text-align:left;padding:0.35rem;">Phone</th>
                  <th style="text-align:left;padding:0.35rem;">Address</th>
                  <th style="text-align:left;padding:0.35rem;">Doctor ID</th>
                  <th style="text-align:left;padding:0.35rem;">Doctor name</th>
                  <th style="text-align:left;padding:0.35rem;">Specialty</th>
                  <th style="text-align:left;padding:0.35rem;">Secretary ID</th>
                  <th style="text-align:left;padding:0.35rem;">Secretary name</th>
                  <th style="text-align:left;padding:0.35rem;">Owner ID</th>
                  <th style="text-align:left;padding:0.35rem;">Owner name</th>
                  <th style="text-align:left;padding:0.35rem;">Actions</th>
                </tr></thead>
                <tbody>${rows || "<tr><td colspan='18'>No users</td></tr>"}</tbody>
              </table>
            </div>
          </div>`;

        const roleSel = root.querySelector('select[name="role"]');
        const extraPat = root.querySelector("#extra-patient");
        const extraDoc = root.querySelector("#extra-doctor");
        function syncExtras() {
            const r = roleSel.value;
            extraPat.style.display = r === "PATIENT" ? "flex" : "none";
            extraDoc.style.display = r === "DOCTOR" ? "block" : "none";
        }
        roleSel.addEventListener("change", syncExtras);
        syncExtras();

        root.querySelector("#form-create-user").addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const role = fd.get("role");
            const body = {
                email: fd.get("email"),
                password: fd.get("password"),
                role,
                name: fd.get("name"),
            };
            if (role === "PATIENT") {
                body.gender = fd.get("gender");
                body.dateOfBirth = fd.get("dateOfBirth");
                body.phoneNumber = fd.get("phoneNumber");
                body.address = fd.get("address") || "";
            }
            if (role === "DOCTOR") {
                body.specialty = fd.get("specialty");
            }
            const msg = root.querySelector("#create-msg");
            msg.textContent = "";
            try {
                const res = await api("/api/owner/users", {
                    method: "POST",
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    msg.textContent = err.message || "Create failed";
                    return;
                }
                e.target.reset();
                syncExtras();
                await refresh();
            } catch (err) {
                msg.textContent = "Network error";
            }
        });

        root.querySelectorAll(".btn-del-user").forEach((btn) => {
            btn.addEventListener("click", async () => {
                if (!confirm("Delete this user?")) return;
                const id = btn.getAttribute("data-id");
                const res = await api("/api/owner/users/" + id, { method: "DELETE" });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.message || "Delete failed");
                    return;
                }
                await refresh();
            });
        });

        root.querySelectorAll(".btn-edit-user").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const u = (users || []).find((x) => String(x.userId) === String(id));
                const email = prompt("New email (leave empty to keep)", u.email);
                if (email === null) return;
                const pwd = prompt("New password (leave empty to keep)", "");
                if (pwd === null) return;
                const name = prompt("Display name (leave empty to keep)", displayLabel(u) || "");
                if (name === null) return;
                const payload = {};
                if (email.trim()) payload.email = email.trim();
                if (pwd.trim()) payload.password = pwd.trim();
                if (name.trim()) payload.name = name.trim();
                if (Object.keys(payload).length === 0) return;
                const res = await api("/api/owner/users/" + id, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert(err.message || "Update failed");
                    return;
                }
                await refresh();
            });
        });
    }

    function escapeHtml(s) {
        const d = document.createElement("div");
        d.textContent = s == null ? "" : String(s);
        return d.innerHTML;
    }

    async function refresh() {
        const res = await api("/api/owner/users");
        if (!res.ok) {
            root.textContent = "Failed to load users.";
            return;
        }
        const list = await res.json();
        render(list);
    }

    if (window.initSmartClinicNavbar) window.initSmartClinicNavbar();
    await refresh();
});
