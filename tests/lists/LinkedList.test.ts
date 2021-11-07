import test from 'tape';
import LinkedList from '../../src/lists/LinkedList';

test('LinkedList.append', async ({ deepEqual }) => {
  const list = new LinkedList<string>();

  list.append('cat').append('dog').append('fish');

  deepEqual(Array.from(list), ['cat', 'dog', 'fish']);
});

test('LinkedList.prepend', async ({ deepEqual }) => {
  const list = new LinkedList<string>();

  list.prepend('cat').prepend('dog').prepend('fish');

  deepEqual(Array.from(list), ['fish', 'dog', 'cat']);
});

test('LinkedList Iterator', async ({ equal }) => {
  const list = new LinkedList<string>();

  list.append('cat').append('dog').prepend('fish');

  const expected = ['fish', 'cat', 'dog'];

  for (const s of list) {
    equal(s, expected.shift());
  }
});
