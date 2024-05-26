import { Navigate, useNavigate } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { z } from "zod";
import { useApiClient } from "../context/ApiClientContext";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const Login = () => {
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const auth = useAuth();

  const user = auth.user();

  const [error, setError] = createSignal<string>();

  const submit = async (values: { username: string; password: string }) => {
    const res = await apiClient.login(values);
    if (res.status === "error") {
      setError(res.error.message);
      return;
    }

    auth.setToken(res.data.token);
    navigate("/");
  };

  return (
    <>
      <Show when={!user()} fallback={<Navigate href="/" />}>
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
