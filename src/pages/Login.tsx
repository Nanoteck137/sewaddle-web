import { reporter, ValidationMessage } from "@felte/reporter-solid";
import { createForm } from "@felte/solid";
import { validator } from "@felte/validator-zod";
import { Navigate, useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const Login = () => {
  const auth = useAuth();

  const navigate = useNavigate();

  const { form } = createForm<z.infer<typeof schema>>({
    extend: [validator({ schema }), reporter()],
    onSubmit: (values) => {
      auth.signIn(values.username, values.password).then(() => {
        navigate("/");
      });
    },
  });

  const user = auth.getUser();

  return (
    <>
      <Show when={!user()} fallback={<Navigate href="/" />}>
        <p>Login Page</p>

        <form use:form>
          <label for="username">Username</label>
          <input id="username" name="username" type="text" />
          <ValidationMessage for="username">
            {(message) => <p>{message?.[0]}</p>}
          </ValidationMessage>

          <label for="password">Password</label>
          <input id="password" name="password" type="password" />
          <ValidationMessage for="password">
            {(message) => <p>{message?.[0]}</p>}
          </ValidationMessage>

          <button type="submit">Login</button>
        </form>
      </Show>
    </>
  );
};

export default Login;
