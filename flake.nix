{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    gitignore.url = "github:hercules-ci/gitignore.nix";
    gitignore.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, flake-utils, nixpkgs, gitignore }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        app = pkgs.buildNpmPackage {
          name = "sewaddle-web";
          version = "v0.0.1";
          src = gitignore.lib.gitignoreSource ./.;
          npmDepsHash = "sha256-K89Vuj9VDmRbNdNvK9L+a0YdbDToOXYFtBZRrqFg89w=";

          # postPatch = ''
          #   cp frontend/package-lock.json .
          # '';

          installPhase = ''
            runHook preInstall
            cp -r dist $out/
            runHook postInstall
          '';
        };

      in with pkgs; {
        packages.default = app;
        devShells.default = mkShell { buildInputs = [ pkgs.yarn nodejs node2nix ]; };
      }
    );
}
