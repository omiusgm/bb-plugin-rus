import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  'Active child threads': 'Активные дочерние треды', 'Child threads': 'Дочерние треды',
  'Back to active child threads': 'Назад к активным дочерним тредам',
};
const disposers: (() => void)[] = [];
function mount(html: string) {
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });

const toggle = 'id="thread-prompt-banner-child-threads-toggle"';
const banner = (inner: string, label = 'Child threads') =>
  `<div data-app-composer data-promptbox-shell><section aria-label="${label}">${inner}</section></div>`;
const header = `<button type="button" ${toggle} aria-expanded="false" aria-label="3 active child threads">
  <svg data-icon="ChildThread" data-icon-root></svg><span class="min-w-0 flex-1 truncate text-left">Active child threads</span><span><span>3</span></span></button>`;

it('translates the banner header and landmark, keeps the counted label', async () => {
  mount(banner(header));
  await settle();
  expect(document.querySelector('section')!.getAttribute('aria-label')).toBe('Дочерние треды');
  expect(document.querySelector('button > span')!.textContent).toBe('Активные дочерние треды');
  expect(document.querySelector('button')!.getAttribute('aria-label')).toBe('3 active child threads');
  expect(document.querySelectorAll('button > span')[1].textContent).toBe('3');
});

it('translates the back button of an opened question', async () => {
  mount(banner(`<button type="button" ${toggle} aria-label="Back to active child threads">
    <svg data-icon="ChevronLeft" data-icon-root></svg><span class="truncate">Active child threads</span></button>`));
  await settle();
  const button = document.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Назад к активным дочерним тредам');
  expect(button.getAttribute('data-rus-original-aria-label')).toBe('Back to active child threads');
  expect(button.querySelector('span')!.textContent).toBe('Активные дочерние треды');
});

it('never translates a child thread title that equals the header text', async () => {
  mount(banner(`<button type="button" ${toggle} aria-label="1 active child thread">
    <svg data-icon="ChildThread" data-icon-root></svg>
    <span class="flex min-w-0 flex-1"><span data-thread-title class="truncate">Active child threads</span></span></button>
    <div><a href="/projects/p/threads/t"><span class="truncate">Active child threads</span></a></div>`));
  await settle();
  expect([...document.querySelectorAll('span.truncate')].map(node => node.textContent)).toEqual(['Active child threads', 'Active child threads']);
  expect(document.querySelector('button > span')!.textContent).toBe('Active child threads');
});

it('requires the composer, the banner section and the toggle identity', async () => {
  mount(`<section aria-label="Child threads"><button type="button" ${toggle}><span class="truncate">Active child threads</span></button></section>
    <div data-app-composer><section aria-label="Child threads"><button type="button" id="other"><span class="truncate">Active child threads</span></button></section></div>
    <div data-app-composer><div data-bb-plugin-root data-bb-plugin="unknown"><section aria-label="Child threads"><button type="button" ${toggle}><span class="truncate">Active child threads</span></button></section></div></div>`);
  await settle();
  expect([...document.querySelectorAll('span')].map(node => node.textContent)).toEqual(Array(3).fill('Active child threads'));
  expect([...document.querySelectorAll('section')].map(node => node.getAttribute('aria-label'))).toEqual(Array(3).fill('Child threads'));
});

it('restores the English text on dispose', async () => {
  const dispose = mount(banner(header));
  await settle();
  dispose();
  expect(document.querySelector('section')!.getAttribute('aria-label')).toBe('Child threads');
  expect(document.querySelector('button > span')!.textContent).toBe('Active child threads');
});
