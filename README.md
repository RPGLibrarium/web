# Install Hugo
The website is built with [Hugo](https://gohugo.io/getting-started/installing/). Install it to test the page locally. 

# After checkout
We use submodules for the theme and fonts. Initialize them und update when necessary. Not sure what is necessary when but a combination of the three commands below should do the trick.
```sh
git submodule init
git submodule update --recursive
git checkout --recurse-submodules
```

# Creating new events
The following command will use the archetype and set a couple of properties automatically. Don't forget to 
change them, if necessary. 
```sh
hugo new events/YYYY-MM-DD-a-short-title.md
```

# Testing the website locally
```sh
hugo server
```

and to display drafts

```sh
hugo server -D
```
