import assert from "node:assert/strict";

const baseUrl = process.env.FEEDFLOW_BASE_URL ?? "http://127.0.0.1:3000";

async function request(path, init = {}, cookie = "") {
  const headers = new Headers(init.headers ?? {});
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const body = await response.json().catch(() => null);
  return { response, body, cookie: response.headers.get("set-cookie")?.split(";")[0] ?? cookie };
}

async function login(email, password = "password") {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

const anonymousWrite = await request("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: "anonymous write" })
});
assert.equal(anonymousWrite.response.status, 401);

const demoLogin = await login("demo@feedflow.local");
assert.equal(demoLogin.response.status, 200);

const post = await request(
  "/api/posts",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `smoke ${Date.now()}` })
  },
  demoLogin.cookie
);
assert.equal(post.response.status, 201);
assert.ok(post.body.data.id);

const patch = await request(
  `/api/posts/${post.body.data.id}`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "smoke edited" })
  },
  demoLogin.cookie
);
assert.equal(patch.response.status, 200);

const like = await request(`/api/posts/${post.body.data.id}/like`, { method: "POST" }, demoLogin.cookie);
assert.equal(like.response.status, 200);

const reportsAsUser = await request("/api/admin/reports", {}, demoLogin.cookie);
assert.equal(reportsAsUser.response.status, 403);

const adminLogin = await login("admin@feedflow.local");
assert.equal(adminLogin.response.status, 200);

const reportsAsAdmin = await request("/api/admin/reports", {}, adminLogin.cookie);
assert.equal(reportsAsAdmin.response.status, 200);

console.log("Smoke test passed");
