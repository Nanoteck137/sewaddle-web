import { Navigate, useNavigate } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { z } from "zod";
import { useApiClient } from "../context/ApiClientContext";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  passwordConfirm: z.string().min(1),
});

const Register = () => {
  const navigate = useNavigate();
  const apiClient = useApiClient();

  const auth = useAuth();
  const user = auth.user();

  const [error, setError] = createSignal<string>();

  const submit = (values: {
    username: string;
    password: string;
    passwordConfirm: string;
  }) => {
    apiClient
      .signup(values)
      .then(() => {
        navigate("/");
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  return (
    <>
      <Show when={!user()} fallback={<Navigate href="/" />}>
        <p>Register Page</p>

        {error() && <p>Error: {error()}</p>}

        <form
          class="flex flex-col"
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

          <label for="passwordConfirm">Confirm Password</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" />

          <button type="submit">Register</button>
        </form>
      </Show>
    </>
  );
};

export default Register;
