{
  description = "Sewaddle web interface";

  inputs = {
    nixpkgs.url      = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url  = "github:numtide/flake-utils";

    pyrin.url        = "github:nanoteck137/pyrin/v0.6.5";
    pyrin.inputs.nixpkgs.follows = "nixpkgs";

    devtools.url     = "github:nanoteck137/devtools";
    devtools.inputs.nixpkgs.follows = "nixpkgs";

    gitignore.url = "github:hercules-ci/gitignore.nix";
    gitignore.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils, gitignore, pyrin, devtools, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        version = pkgs.lib.strings.fileContents "${self}/version";
        rev = self.dirtyShortRev or self.shortRev or "dirty";
        fullVersion = ''${version}-${rev}'';

        app = pkgs.buildNpmPackage {
          name = "sewaddle-web";
          version = fullVersion;

          src = gitignore.lib.gitignoreSource ./.;
          npmDepsHash = "sha256-iExJLb5vqA7wlzhZ3b1TRaS0j34waNGy7lFp8G3fnCo=";

          PUBLIC_VERSION=version;
          PUBLIC_COMMIT=self.rev or "dirty";

          installPhase = ''
            runHook preInstall
            cp -r build $out/
            echo '{ "type": "module" }' > $out/package.json

            mkdir $out/bin
            echo -e "#!${pkgs.runtimeShell}\n${pkgs.nodejs}/bin/node $out\n" > $out/bin/sewaddle-web
            chmod +x $out/bin/sewaddle-web

            runHook postInstall
          '';
        };

        tools = devtools.packages.${system};
      in
      {
        packages.default = app;

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            python3
            
            pyrin.packages.${system}.default
            tools.publishVersion
          ];
        };
      }
    ) // {
      nixosModules.default = { config, lib, pkgs, ... }:
        with lib; let
          cfg = config.services.sewaddle-web;
        in
        {
          options.services.sewaddle-web = {
            enable = mkEnableOption "Enable the sewaddle-web service";

            port = mkOption {
              type = types.port;
              default = 4006;
              description = "port to listen on";
            };

            host = mkOption {
              type = types.str;
              default = "";
              description = "hostname or address to listen on";
            };

            apiAddress = mkOption {
              type = types.str;
              description = "address to the api server";
            };

            package = mkOption {
              type = types.package;
              default = self.packages.${pkgs.system}.default;
              description = "package to use for this service (defaults to the one in the flake)";
            };

            user = mkOption {
              type = types.str;
              default = "sewaddle-web";
              description = "user to use for this service";
            };

            group = mkOption {
              type = types.str;
              default = "sewaddle-web";
              description = "group to use for this service";
            };
          };

          config = mkIf cfg.enable {
            systemd.services.sewaddle-web = {
              description = "Frontend for sewaddle";
              wantedBy = [ "multi-user.target" ];

              environment = {
                PORT = "${toString cfg.port}";
                HOST = "${cfg.host}";
                API_ADDRESS = "${cfg.apiAddress}";
                HOST_HEADER = "x-forwarded-host";
              };

              serviceConfig = {
                User = cfg.user;
                Group = cfg.group;

                ExecStart = "${cfg.package}/bin/sewaddle-web";

                Restart = "on-failure";
                RestartSec = "5s";

                ProtectHome = true;
                ProtectHostname = true;
                ProtectKernelLogs = true;
                ProtectKernelModules = true;
                ProtectKernelTunables = true;
                ProtectProc = "invisible";
                ProtectSystem = "strict";
                RestrictAddressFamilies = [ "AF_INET" "AF_INET6" "AF_UNIX" ];
                RestrictNamespaces = true;
                RestrictRealtime = true;
                RestrictSUIDSGID = true;
              };
            };

            users.users = mkIf (cfg.user == "sewaddle-web") {
              sewaddle-web= {
                group = cfg.group;
                isSystemUser = true;
              };
            };

            users.groups = mkIf (cfg.group == "sewaddle-web") {
              sewaddle-web = {};
            };
          };
        };
    };
}
