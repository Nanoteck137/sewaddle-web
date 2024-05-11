import { Navigate, useNavigate } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { z } from "zod";
import { useApiClient } from "../context/ApiClientContext";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
});

const Register = () => {
  const navigate = useNavigate();
  const apiClient = useApiClient();

  const [error, setError] = createSignal<string>();

  const submit = (values: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    apiClient
      .register(values.username, values.password, values.confirmPassword)
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

          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" />

          <button type="submit">Register</button>
        </form>
      </Show>
    </>
  );
};

export default Register;
