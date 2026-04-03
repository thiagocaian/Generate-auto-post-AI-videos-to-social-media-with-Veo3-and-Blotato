import json
import os
import subprocess
import sys
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Ghost Lab")

# ---------------------------------------------------------------------------
# 1. HTTP Requests — call any API, n8n webhook, REST endpoint
# ---------------------------------------------------------------------------

@mcp.tool()
async def http_request(
    url: str,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    body: str | None = None,
    timeout: float = 30.0,
) -> str:
    """Make an HTTP request to any URL (APIs, n8n webhooks, etc.).

    Args:
        url: Full URL to call (e.g. https://n8n.example.com/webhook/abc)
        method: HTTP method — GET, POST, PUT, PATCH, DELETE
        headers: Optional dict of HTTP headers
        body: Optional request body (JSON string or plain text)
        timeout: Request timeout in seconds (default 30)
    """
    req_headers = {"User-Agent": "ghost-lab/1.0", "Accept": "application/json"}
    if headers:
        req_headers.update(headers)

    content_to_send = None
    if body:
        # Auto-detect JSON
        try:
            json.loads(body)
            req_headers.setdefault("Content-Type", "application/json")
        except (json.JSONDecodeError, TypeError):
            req_headers.setdefault("Content-Type", "text/plain")
        content_to_send = body

    async with httpx.AsyncClient() as client:
        try:
            response = await client.request(
                method=method.upper(),
                url=url,
                headers=req_headers,
                content=content_to_send,
                timeout=timeout,
            )
            # Build result
            result = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
            }
            # Try to parse JSON response
            try:
                result["json"] = response.json()
            except Exception:
                result["text"] = response.text
            return json.dumps(result, indent=2, ensure_ascii=False)
        except Exception as e:
            return f"HTTP request failed: {e}"


# ---------------------------------------------------------------------------
# 2. Python Executor — run Python code or scripts
# ---------------------------------------------------------------------------

@mcp.tool()
async def run_python(code: str, timeout: float = 60.0) -> str:
    """Execute Python code and return stdout/stderr.

    Args:
        code: Python code to execute
        timeout: Max execution time in seconds (default 60)
    """
    try:
        result = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=os.path.expanduser("~"),
        )
        output = ""
        if result.stdout:
            output += result.stdout
        if result.stderr:
            output += f"\n[stderr]\n{result.stderr}"
        if result.returncode != 0:
            output += f"\n[exit code: {result.returncode}]"
        return output.strip() or "(no output)"
    except subprocess.TimeoutExpired:
        return f"Execution timed out after {timeout}s"
    except Exception as e:
        return f"Execution failed: {e}"


@mcp.tool()
async def run_script(path: str, args: list[str] | None = None, timeout: float = 120.0) -> str:
    """Execute a Python script file.

    Args:
        path: Path to the .py script
        args: Optional list of command-line arguments
        timeout: Max execution time in seconds (default 120)
    """
    path = os.path.expanduser(path)
    if not os.path.isfile(path):
        return f"File not found: {path}"

    cmd = [sys.executable, path] + (args or [])
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=os.path.dirname(path) or ".",
        )
        output = ""
        if result.stdout:
            output += result.stdout
        if result.stderr:
            output += f"\n[stderr]\n{result.stderr}"
        if result.returncode != 0:
            output += f"\n[exit code: {result.returncode}]"
        return output.strip() or "(no output)"
    except subprocess.TimeoutExpired:
        return f"Script timed out after {timeout}s"
    except Exception as e:
        return f"Script execution failed: {e}"


# ---------------------------------------------------------------------------
# 3. Shell — run any shell command
# ---------------------------------------------------------------------------

@mcp.tool()
async def run_shell(command: str, cwd: str | None = None, timeout: float = 60.0) -> str:
    """Run a shell command and return output.

    Args:
        command: Shell command to execute
        cwd: Working directory (default: home directory)
        timeout: Max execution time in seconds (default 60)
    """
    work_dir = os.path.expanduser(cwd) if cwd else os.path.expanduser("~")
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=work_dir,
        )
        output = ""
        if result.stdout:
            output += result.stdout
        if result.stderr:
            output += f"\n[stderr]\n{result.stderr}"
        if result.returncode != 0:
            output += f"\n[exit code: {result.returncode}]"
        return output.strip() or "(no output)"
    except subprocess.TimeoutExpired:
        return f"Command timed out after {timeout}s"
    except Exception as e:
        return f"Command failed: {e}"


# ---------------------------------------------------------------------------
# 4. Filesystem — read, write, list files
# ---------------------------------------------------------------------------

@mcp.tool()
async def read_file(path: str) -> str:
    """Read a file and return its contents.

    Args:
        path: Path to the file
    """
    path = os.path.expanduser(path)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"


@mcp.tool()
async def write_file(path: str, content: str, append: bool = False) -> str:
    """Write content to a file.

    Args:
        path: Path to the file
        content: Content to write
        append: If True, append instead of overwrite (default False)
    """
    path = os.path.expanduser(path)
    try:
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        mode = "a" if append else "w"
        with open(path, mode, encoding="utf-8") as f:
            f.write(content)
        return f"OK — wrote {len(content)} chars to {path}"
    except Exception as e:
        return f"Error writing file: {e}"


@mcp.tool()
async def list_dir(path: str = ".", recursive: bool = False) -> str:
    """List files and directories.

    Args:
        path: Directory path (default: current dir)
        recursive: If True, list recursively (default False)
    """
    path = os.path.expanduser(path)
    try:
        if recursive:
            entries = []
            for root, dirs, files in os.walk(path):
                # Skip hidden dirs
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for name in sorted(dirs + files):
                    full = os.path.join(root, name)
                    rel = os.path.relpath(full, path)
                    suffix = "/" if os.path.isdir(full) else ""
                    entries.append(f"{rel}{suffix}")
            return "\n".join(entries[:500]) or "(empty)"
        else:
            entries = sorted(os.listdir(path))
            lines = []
            for e in entries:
                full = os.path.join(path, e)
                suffix = "/" if os.path.isdir(full) else ""
                lines.append(f"{e}{suffix}")
            return "\n".join(lines) or "(empty)"
    except Exception as e:
        return f"Error listing directory: {e}"


# ---------------------------------------------------------------------------
# 5. Weather (original tools — kept for convenience)
# ---------------------------------------------------------------------------

NWS_API_BASE = "https://api.weather.gov"


async def _nws_request(url: str) -> dict[str, Any] | None:
    headers = {"User-Agent": "ghost-lab/1.0", "Accept": "application/geo+json"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None


@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.

    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    data = await _nws_request(f"{NWS_API_BASE}/alerts/active/area/{state}")
    if not data or "features" not in data:
        return "Unable to fetch alerts or no alerts found."
    if not data["features"]:
        return "No active alerts for this state."
    alerts = []
    for f in data["features"]:
        p = f["properties"]
        alerts.append(
            f"Event: {p.get('event', 'Unknown')}\n"
            f"Area: {p.get('areaDesc', 'Unknown')}\n"
            f"Severity: {p.get('severity', 'Unknown')}\n"
            f"Description: {p.get('description', 'N/A')}\n"
            f"Instructions: {p.get('instruction', 'N/A')}"
        )
    return "\n---\n".join(alerts)


@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location.

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    """
    points_data = await _nws_request(f"{NWS_API_BASE}/points/{latitude},{longitude}")
    if not points_data:
        return "Unable to fetch forecast data for this location."
    forecast_url = points_data["properties"]["forecast"]
    forecast_data = await _nws_request(forecast_url)
    if not forecast_data:
        return "Unable to fetch detailed forecast."
    periods = forecast_data["properties"]["periods"]
    forecasts = []
    for p in periods[:5]:
        forecasts.append(
            f"{p['name']}:\n"
            f"Temperature: {p['temperature']}°{p['temperatureUnit']}\n"
            f"Wind: {p['windSpeed']} {p['windDirection']}\n"
            f"Forecast: {p['detailedForecast']}"
        )
    return "\n---\n".join(forecasts)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
