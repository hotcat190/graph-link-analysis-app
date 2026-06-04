import os
import sys

# Reconfigure stdout and stderr to UTF-8 encoding to avoid Windows encoding issues
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure backend/src is in python path to avoid import errors when running from root backend folder
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.abspath(os.path.join(current_dir, ".."))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

import typer
from cli.commands.dev import app as dev_app

app = typer.Typer(
    name="link-analysis-cli",
    help="CLI developer tools for Graph Link Analysis App",
    no_args_is_help=True,
)

app.add_typer(dev_app, name="dev")

def main():
    app()

if __name__ == "__main__":
    main()
