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

        version = builtins.substring 0 8 self.lastModifiedDate;

        app = pkgs.buildNpmPackage {
          name = "sewaddle-web";
          inherit version;

          src = gitignore.lib.gitignoreSource ./.;
          npmDepsHash = "sha256-K89Vuj9VDmRbNdNvK9L+a0YdbDToOXYFtBZRrqFg89w=";

          installPhase = ''
            runHook preInstall
            cp -r dist $out/
            runHook postInstall
          '';
        };

      in with pkgs; {
        packages.default = app;
        devShells.default = mkShell { 
          buildInputs = [ 
            nodejs 
          ]; 
        };
      }
    );
}
