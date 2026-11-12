import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const script = resolve(root, process.argv[2] ?? "");
const scriptArgs = process.argv.slice(3);
const commands = process.platform === "win32"
  ? [["py", ["-3"]], ["python3", []], ["python", []]]
  : [["python3", []], ["python", []]];

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.error?.code === "ENOENT") return null;
  if (result.error) throw new Error(`No se pudo ejecutar ${command}: ${result.error.message}`);
  return result;
}

for (const [command, prefix] of commands) {
  const version = run(command, [...prefix, "--version"]);
  if (!version) continue;
  if (version.status !== 0) {
    throw new Error(`${command} --version falló: ${version.stderr.trim()}`);
  }
  const match = version.stdout.match(/Python\s+(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`No se pudo interpretar la versión de Python: ${version.stdout.trim()}`);
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major < 3 || (major === 3 && minor < 12)) {
    throw new Error(`Python 3.12 o superior es obligatorio; se encontró ${major}.${minor}.`);
  }
  const result = run(command, [...prefix, script, ...scriptArgs]);
  if (!result) continue;
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.status ?? 1;
  process.exit();
}

throw new Error("No se encontró Python 3.12 o superior. Instálalo y comprueba el lanzador 'py -3' o el comando 'python3'.");
