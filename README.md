# A Tutorial for [Backstage](https://backstage.io)

## Configuring the application

The project provides a script for configuring the application.
The script is repoonsible for creating the `local` configuration `app-config.local.yaml` that is used by default when running the application in development mode.
The file is created using various template `.tmpl.yaml` in the repository.
The templates are rendered using:

- environment variables
- flags passed to the script
- using password-store (reading env/variable)

The script can be run using:

```sh
./bin/configure
```

To view all available options run:

```sh
./bin/configure --help
```

## Running the Backstage application

```sh
yarn install
yarn dev
```
