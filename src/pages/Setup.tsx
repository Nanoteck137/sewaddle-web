import { createSignal } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";
import { PostSystemSetupBody } from "../lib/models/apiGen";

const Setup = () => {
  const apiClient = useApiClient();

  const [page, setPage] = createSignal(0);

  let userForm!: HTMLFormElement;

  function nextPage() {
    setPage((prev) => prev + 1);
  }

  function prevPage() {
    setPage((prev) => prev - 1);
  }

  function finishSetup() {
    const userFormData = Object.fromEntries(new FormData(userForm));
    const body = PostSystemSetupBody.parse(userFormData);
    apiClient
      .setup(body)
      .then(() => (window.location.href = "/"))
      .catch((e) => console.error(e));
  }

  return (
    <>
      <div class={`${page() === 0 ? "" : "hidden"}`}>
        <p>Page 1: User Creation</p>
        <form
          ref={userForm}
          class="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label for="username">Username</label>
          <input id="username" name="username" type="text" />

          <label for="new-password">Password</label>
          <input
            id="new-password"
            name="password"
            type="password"
            autocomplete="new-password"
          />

          <label for="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autocomplete="new-password"
          />
        </form>
        <button onClick={nextPage}>Next Page</button>
      </div>

      <div class={`${page() === 1 ? "" : "hidden"}`}>
        <p>Page 2: Summary</p>
        <button onClick={prevPage}>Prev Page</button>
        <button onClick={finishSetup}>Finish Setup</button>
      </div>
    </>
  );
};

export default Setup;
