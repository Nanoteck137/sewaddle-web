import { createSignal } from "solid-js";

const Setup = () => {
  const [page, setPage] = createSignal(0);

  const nextPage = () => {
    setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setPage((prev) => prev - 1);
  };

  return (
    <>
      <div class={`${page() === 0 ? "" : "hidden"}`}>
        <p>Page 1: User Creation</p>
        <form
          class="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label for="username">Username</label>
          <input id="username" type="text" />

          <label for="new-password">Password</label>
          <input
            id="new-password"
            type="password"
            autocomplete="new-password"
          />

          <label for="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            type="password"
            autocomplete="new-password"
          />
        </form>
        <button onClick={nextPage}>Next Page</button>
      </div>

      <div class={`${page() === 1 ? "" : "hidden"}`}>
        <p>Page 2: Summary</p>
        <button onClick={prevPage}>Prev Page</button>
      </div>
    </>
  );
};

export default Setup;
