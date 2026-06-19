import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Building2, Mail, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "../api/auth";

type LoginForm = {
  email: string;
  password: string;
};

const LoginSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const defaultValues: LoginForm = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      queryClient.setQueryData(["me"], data);
      await navigate({ to: "/dashboard" });
    },
  });
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
    validators: { onChange: LoginSchema },
  });

  return (
    <div className="bg-white rounded-xl w-md shadow-xl border-[#C3C6D7] border">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="p-8"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-[#2563EB] rounded-xl size-16 flex items-center justify-center">
            <Building2 color="#EEEFFF" width={32} height={32} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-3xl">Nexus Erp</h1>
            <p className="text-[#434655] text-sm">Mangagment Suite</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <form.Field name="email">
            {(field) => {
              return (
                <>
                  <label className="text-sm" htmlFor="email">
                    Email Address
                  </label>
                  <div className="flex items-center rounded border-[#C3C6D7] border py-2 px-4 gap-2 focus-within:outline-1">
                    <Mail color="#737686" width={18} height={18} />
                    <input
                      className="w-full outline-0"
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Joe@example.com"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-sm text-red-500 text-center">
                      {field.state.meta.errors
                        .map((error) =>
                          typeof error === "string"
                            ? error
                            : error &&
                                typeof error === "object" &&
                                "message" in error
                              ? String(error.message)
                              : "Invalid field",
                        )
                        .join(", ")}
                    </em>
                  )}
                </>
              );
            }}
          </form.Field>
          <form.Field name="password">
            {(field) => {
              return (
                <>
                  <label className="text-sm" htmlFor="password">
                    Password
                  </label>
                  <div className="flex items-center rounded border-[#C3C6D7] border py-2 px-4 gap-2 focus-within:outline-1">
                    <Lock color="#737686" width={18} height={18} />
                    <input
                      className="w-full outline-0"
                      type="password"
                      name="password"
                      id="password"
                      value={field.state.value}
                      placeholder="********"
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                      }}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-sm text-red-500 text-center">
                      {field.state.meta.errors
                        .map((error) =>
                          typeof error === "string"
                            ? error
                            : error &&
                                typeof error === "object" &&
                                "message" in error
                              ? String(error.message)
                              : "Invalid field",
                        )
                        .join(", ")}
                    </em>
                  )}
                </>
              );
            }}
          </form.Field>
        </div>
        <div className="text-center my-10">
          {loginMutation.isError && (
            <p className="mb-4 rounded bg-red-50 px-3 py-2 text-center text-sm text-red-500">
              {loginMutation.error.message}
            </p>
          )}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex cursor-pointer items-center justify-center text-[1rem] gap-2 w-full rounded p-2 font-semibold bg-[#2563EB] text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
      <div className="bg-[#F3F3FE] py-4 rounded-b-xl w-full flex items-center justify-center border border-[#C3C6D7]">
        <p className="text-[#434655] text-[13px]">Secure ERP Portal © 2024</p>
      </div>
    </div>
  );
}
