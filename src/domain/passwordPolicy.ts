const configuredLength = Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH);

export const passwordMinimum = Number.isInteger(configuredLength) && configuredLength >= 6
  ? configuredLength
  : 8;

const groups = [
  { id: "lower", label: "uma letra minúscula", pattern: /[a-z]/ },
  { id: "upper", label: "uma letra maiúscula", pattern: /[A-Z]/ },
  { id: "digit", label: "um número", pattern: /[0-9]/ },
  { id: "symbol", label: "um símbolo", pattern: /[!@#$%^&*()_+=[\]{};'\\:"|<>?,./`~-]/ },
];

const configuredGroups = String(import.meta.env.VITE_PASSWORD_REQUIRED_GROUPS ?? "").split(",").map((group) => group.trim());
export const requiredPasswordGroups = groups.filter(({ id }) => configuredGroups.includes(id));

export function passwordProblems(value: string) {
  const missing = requiredPasswordGroups.filter(({ pattern }) => !pattern.test(value)).map(({ label }) => label);
  if ([...value].length < passwordMinimum) missing.unshift(`pelo menos ${passwordMinimum} caracteres`);
  return missing;
}
