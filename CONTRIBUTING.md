## Pull Requests

Pull requests are welcome for bugfixes and small suggestions.

If you'd like a new feature, please open an issue to discuss before investing time in writing the code!

## Running tests

This repo uses Jest.

```sh
yarn test
# or
yarn test --watch
```

## Developing the examples

First you have to link the lib.

```sh
# from the root
yarn build
yarn link
```

Then in one tab compile on file changes

```
yarn watch
```

And in another tab run the example

```sh
# in a new tab
cd examples/<whatever>
yarn link "axs-router"
yarn start
```
