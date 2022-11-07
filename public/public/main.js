const loginForm = () => {
  const actionUserSave = () => {
    const username = document.querySelector("#public-input-username");
    const password = document.querySelector("#public-input-password");
    const action = document.querySelector("#public-action-login");
    action.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rawResponse = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      });
      const result = await rawResponse.json();
      if (!result.error) {
        localStorage.setItem('token', result.token);
        // window.location.href = "/dashboard/posts";
      }
    });
  };

  actionUserSave();
};
