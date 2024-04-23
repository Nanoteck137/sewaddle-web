import { Navigate, useNavigate } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { z } from "zod";
import { useApiClient } from "../context/ApiClientContext";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const Login = () => {
  const navigate = useNavigate();
  const apiClient = useApiClient();

  const [error, setError] = createSignal<string>();

  const submit = (values: { username: string; password: string }) => {
    apiClient
      .login(values.username, values.password)
      .then(() => {
        navigate("/");
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  return (
    <>
      <Show when={true} fallback={<Navigate href="/" />}>
        <p>Login Page</p>

        {error() && <p>Error: {error()}</p>}

        <form
          ref={(e) => {
            const inputs = e.querySelectorAll("input");

            e.addEventListener("submit", (e) => {
              e.preventDefault();

              const values: Record<string, string> = {};
              inputs.forEach((i) => {
                values[i.name] = i.value;
              });

              const res = schema.parse(values);
              submit(res);
            });
          }}
        >
          <label for="username">Username</label>
          <input id="username" name="username" type="text" />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" />

          <button type="submit">Login</button>
        </form>
      </Show>
    </>
  );
};

export default Login;
