const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 0);
});

async function deleteUserByEmail(email) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this user? This action cannot be undone."
  );
  if (!confirmDelete) {
    return; // Exit if the user cancels the deletion
  }
  try {
    const response = await fetch("/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    alert("User deleted successfully");
    fetchAndDisplayUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete user. Please try again.");
  }
}

async function deactivateUser(email) {
  const confirmDelete = confirm(
    "Are you sure you want to deactivate this user?"
  );
  if (!confirmDelete) {
    return; // Exit if the user cancels the deletion
  }
  try {
    const response = await fetch("/deactivate-user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to deactivate user");
    }

    alert("User deactivated successfully");
    fetchAndDisplayUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error deactivating user:", error);
    alert("Failed to deactivate user. Please try again.");
  }
}

async function activateUser(email) {
  const confirmDelete = confirm("Are you sure you want to activate this user?");
  if (!confirmDelete) {
    return; // Exit if the user cancels the deletion
  }
  try {
    const response = await fetch("/activate-user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to activate user");
    }

    alert("User activated successfully");
    fetchAndDisplayUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error activating user:", error);
    alert("Failed to activate user. Please try again.");
  }
}

async function fetchAndDisplayUsers() {
  try {
    const response = await fetch("/get-all-users");
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();
    console.log(users);
    const usersTableBody = document.getElementById("users");
    usersTableBody.innerHTML = ""; // Clear existing rows

    users.forEach((user) => {
      const row = document.createElement("tr");
      const actionButton = user.isactive
        ? `<button class="deactivate-user">Deactivate</button>`
        : `<button class="activate-user">Activate</button>`;

      row.innerHTML = `
        <td>${user.fname} ${user.lname}</td>
        <td>${user.email}</td>
        <td>${user.tel}</td>
        <td>${actionButton}</td>
        <td><button class="delete-user">Delete</button></td>
      `;
      usersTableBody.appendChild(row);
    });

    // Add event listeners for activate and deactivate buttons
    document.querySelectorAll(".deactivate-user").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const email = event.target
          .closest("tr")
          .querySelector("td:nth-child(2)").textContent;
        await deactivateUser(email);
      });
    });

    document.querySelectorAll(".activate-user").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const email = event.target
          .closest("tr")
          .querySelector("td:nth-child(2)").textContent;
        await activateUser(email);
      });
    });

    document.querySelectorAll(".delete-user").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const email = event.target
          .closest("tr")
          .querySelector("td:nth-child(2)").textContent;
        await deleteUserByEmail(email);
      });
    });
  } catch (error) {
    console.error("Error fetching and displaying users:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayUsers);
