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

        version = self.shortRev or "dirty";

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
      in {
        packages.default = app;
        devShells.default = pkgs.mkShell { 
          buildInputs = with pkgs; [ 
            nodejs 
          ]; 
        };
      }
    );
}
