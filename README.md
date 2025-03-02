# Drawsplash

A fun (and stupid) little experiment on filtering images by drawing

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

This ridiculous experiment is powered by:

- **Next.js**

This initially started of as a Vite app, but it's easier to throw in a couple of API's by using Next.js

- **TanStack Query**

Managing api calls in React without React Query can be a horrible experience. By using it we can avoid the need to handle caching, error handling, race conditions, unsubscriptions, etc etc...

- **TanStack Virtual**

Goes hand in hand with TanStack Query, it allows us to render large lists of data efficiently without blowing up the memory.

- **Motion**

:chefs-kiss: motion library that handles animations for mounts and unmounts

- **OpenAI GPT-4o**

Our fancy AI friend that looks at your terrible drawings and tries to guess what they are. This is done by sending our drawing as an image to the OpenAI API.

## Project Architecture

### Extensible Filtering System

The app uses a `FiltersContext` with a reducer pattern that makes it easy to add new filtering options without having to prop drill or modify existing code.

```tsx
// Example of adding a new filter:
dispatch({ type: 'SET_NEW_FILTER', payload: value });
```

This makes the filtering system extensible for adding more Unsplash API parameters or custom filter options with minimal code changes.

### Virtualized Infinite Scroll

The combination of `TanStack Virtual` and `TanStack Query` enables efficient rendering of potentially thousands of images while only keeping the visible ones in the DOM. This approach prevents memory issues common with infinite scroll implementations.

## Installation

First, clone the repository and install the dependencies:

```shell
git clone https://github.com/rostimelk/drawsplash.git
cd drawsplash
pnpm install
```

The project includes a `.env.template` file with environment variables you'll need to configure. Copy this file to `.env.local` and fill in the required API keys:

```shell
cp .env.template .env
```

Then, run the development server:

```shell
pnpm dev
```
