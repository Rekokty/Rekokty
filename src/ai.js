// Odczytywanie przepisu przez Claude API, wywoływane prosto z aplikacji kluczem użytkownika.
import Anthropic from "@anthropic-ai/sdk";

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

function parseJson(text) {
  const tries = [text, (text.match(/```(?:json)?\s*([\s\S]*?)```/) || [])[1], text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)];
  for (const t of tries) {
    if (!t) continue;
    try {
      return JSON.parse(t);
    } catch (e) {}
  }
  throw { code: "invalid_json" };
}

window.RecipeAI = {
  async json(apiKey, prompt, { image, signal } = {}) {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const content = [];
    if (image) {
      content.push({ type: "image", source: { type: "base64", media_type: image.type || "image/jpeg", data: await toBase64(image) } });
    }
    content.push({ type: "text", text: prompt });
    const base = { model: "claude-opus-5-5", max_tokens: 16000, messages: [{ role: "user", content }] };
    let res;
    try {
      try {
        // Przy odmowie modelu serwer sam przekazuje prośbę do modelu zapasowego.
        res = await client.beta.messages.create({ ...base, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }, { signal });
      } catch (e) {
        if (!(e instanceof Anthropic.BadRequestError)) throw e;
        res = await client.messages.create(base, { signal });
      }
    } catch (e) {
      if (e instanceof Anthropic.APIUserAbortError) throw { code: "cancelled" };
      if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw { code: "bad_key" };
      if (e instanceof Anthropic.RateLimitError) throw { code: "rate_limited" };
      if (e instanceof Anthropic.BadRequestError) throw { code: /credit|billing/i.test(e.message) ? "no_credit" : "image_rejected" };
      if (e instanceof Anthropic.APIConnectionError) throw { code: "offline" };
      throw { code: "failed" };
    }
    if (res.stop_reason === "refusal") throw { code: "refused" };
    return parseJson(res.content.filter((b) => b.type === "text").map((b) => b.text).join(""));
  },
};
