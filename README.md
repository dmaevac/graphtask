# Graphtask

Graphtask is graph based task runner for complex task orchestration scenarios. It is written in Typescript and available as a commonjs or esm.

## Installation

Use the package manager [npm](https://nodejs.org/en/) to install graph task.

```bash
npm install -g graphtask

// or, as a project dependency
npm install graphtask --save-dev
```


## Usage

Graphtask takes a single argument which is a relative path to a folder containing task definitions.

### Writing task definitions (flows and actions).

Graphtask requires two files an NAME.flow.js and NAME.actions.js, these files define _what_ is to be done and _how_ it is to be done.

The most basic example of a flow file is the following.

```js
/*global task */

const actions = require('./tasks.actions');

const first = task({
  name: 'Say a word',
  action: actions.speak,
  params: { word: 'hello' }
});
```

Notice that the flow file references actions. The actions file looks as follows:

```js
module.exports = {
  async speak({ params }) {
    console.log(params.word)
  }
};

```


### CLI

```bash
graphtask ./tasks_folder      # Run tasks in folder
graphtask ./tasks_folder -p   # Generate a task plan (dont execute task actions)

graphtask --help          # Display command help

```

## Examples

See ./examples sub-folders

-- TODO

## Tests

-- TODO

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
