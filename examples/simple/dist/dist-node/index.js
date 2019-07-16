'use strict';

function fullName(firstName, lastName) {
  return `${lastName}, ${firstName}`;
}

async function main() {
  console.log(fullName("Bob", "Loblaw"));
}

main();
