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

const lockEmail = `locked-${Date.now()}@example.com`;
let lockedLogin;
for (let index = 0; index < 6; index += 1) {
  lockedLogin = await request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `203.0.113.${Date.now() % 200}`
    },
    body: JSON.stringify({ email: lockEmail, password: "wrong-password" })
  });
}
assert.equal(lockedLogin.response.status, 423);

const anonymousWrite = await request("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: "anonymous write" })
});
assert.equal(anonymousWrite.response.status, 401);

const demoLogin = await login("demo@feedflow.local");
assert.equal(demoLogin.response.status, 200);

const csrfBlocked = await request(
  "/api/posts",
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify({ content: "csrf write" })
  },
  demoLogin.cookie
);
assert.equal(csrfBlocked.response.status, 403);

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

const unique = Date.now();
const tempEmail = `smoke-${unique}@feedflow.local`;
const tempPassword = "password";
const newTempPassword = "new-password";
const tempSignup = await request("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: tempEmail,
    password: tempPassword,
    handle: `smoke_${unique}`,
    displayName: "Smoke User"
  })
});
assert.equal(tempSignup.response.status, 201);

const resetRequest = await request("/api/auth/password/reset-request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: tempEmail })
});
assert.equal(resetRequest.response.status, 200);
assert.ok(resetRequest.body.data.debugToken);

const reset = await request("/api/auth/password/reset", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: resetRequest.body.data.debugToken,
    password: newTempPassword
  })
});
assert.equal(reset.response.status, 200);

const tempLogin = await login(tempEmail, newTempPassword);
assert.equal(tempLogin.response.status, 200);

const suspend = await request(
  `/api/admin/users/${tempSignup.body.data.id}/suspend`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: "smoke test" })
  },
  adminLogin.cookie
);
assert.equal(suspend.response.status, 200);
assert.equal(suspend.body.data.status, "suspended");

const suspendedLogin = await login(tempEmail, newTempPassword);
assert.equal(suspendedLogin.response.status, 401);

const followers = await request("/api/users/demo/followers");
assert.equal(followers.response.status, 200);

const following = await request("/api/users/demo/following");
assert.equal(following.response.status, 200);

console.log("Smoke test passed");
