# Treelogger

Simplified tree-style logging.

## Basic Usage:

```ts
import { log } from '@esdotgd/treelogger';
const myLog = log('myLog'); // logs a message at the root level
const myChildLog = myLog.blue('myChildLog'); // logs a blue message nested underneath myLog
myChildLog.log('child of myChildLog', { styles: { bold: true } }); // logs a bold message nested underneath myChildLog
myLog.draw(); // print this log and its children to the screen
```

## Example:

```ts
import { log } from '@esdotgd/treelogger';

const recipe = log('Making Chocolate Cake', {
    styles: {
        bold: true, // make this log bold
    },
    cascadingStyles: {
        color: 'blue', // make this log and all its children blue
    },
    childStyles: {
        italic: true, // make all children of this log italic
    },
    charSet: 'bulbs',
});

const prep = recipe.log('Preparation');
prep.log('Preheat oven to 350°F');

prep.log('Grease the pan');

const batter = recipe.log('Make the Batter');
const dry = batter.log('Combine dry ingredients');
dry.log('Flour');
dry.log('Cocoa powder');
dry.log('Baking powder');

const wet = batter.log('Combine wet ingredients');

const eggs = wet.log('Eggs', {
    childStyles: {
        italic: false, // make the egg numbers non-italicized
    },
});
eggs.log('1');
eggs.log('2');
eggs.log('3');
wet.log('Milk');
wet.log('Butter');

batter.log('Combine wet and dry ingredients');
batter.log('Stir until smooth');

recipe.log('Bake for 30 minutes');
recipe.log('Let cool before serving');

recipe.draw();
```

### Output:

Note: styling is not shown here, but it is displayed in the terminal

```
Making Chocolate Cake
├○ Preparation
│  ├○ Preheat oven to 350°F
│  └○ Grease the pan
├○ Make the Batter
│  ├○ Combine dry ingredients
│  │  ├○ Flour
│  │  ├○ Cocoa powder
│  │  └○ Baking powder
│  ├○ Combine wet ingredients
│  │  ├○ Eggs
│  │  │  ├○ 1
│  │  │  ├○ 2
│  │  │  └○ 3
│  │  ├○ Milk
│  │  └○ Butter
│  ├○ Combine wet and dry ingredients
│  └○ Stir until smooth
├○ Bake for 30 minutes
└○ Let cool before serving
```

## Features

- Advanced Styling
- Color Shorthands (e.g. `log.blue('message')`) for child logs
- Infinite Nesting
- Customizable Tree Characters

## Tree Character Sets

- Default:
    ```
    root
    ├─ folderA
    │  ├─ file1
    │  └─ file2
    └─ folderB
    └─ file3
    ```
- ASCII:
    ```
    root
    |- folderA
    |  |- file1
    |  `- file2
    |- folderB
    `- file3
    ```
- Heavy:
    ```
    root
    ┣━ folderA
    ┃  ┣━ file1
    ┃  ┗━ file2
    ┣━ folderB
    ┗━ file3
    ```
- Double:
    ```
    root
    ╠═ folderA
    ║  ╠═ file1
    ║  ╚═ file2
    ╠═ folderB
    ╚═ file3
    ```
- Rounded:
    ```
    root
    ╭─ folderA
    │  ╰─ file1
    │  ╰─ file2
    ╰─ folderB
    ╰─ file3
    ```
- Arrows:
    ```
    root
    ↳ folderA
    →  ↳ file1
    →  ↴ file2
    ↳ folderB
    ↴ file3
    ```
- Bullets:
    ```
    root
    • folderA
       • file1
       • file2
    • folderB
    • file3
    ```
- Bulbs:
    ```
    root
    ├○ folderA
    │  ├○ file1
    │  └○ file2
    ├○ folderB
    └○ file3
    ```
