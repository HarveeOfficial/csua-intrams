import { resolveImageZoomTarget } from './app';

describe('app image zoom helpers', () => {
  it('returns a valid zoom target for an image with a src', () => {
    const image = document.createElement('img');
    image.src = 'https://example.com/photo.jpg';
    image.alt = 'A sample photo';

    expect(resolveImageZoomTarget(image)).toEqual({
      src: 'https://example.com/photo.jpg',
      alt: 'A sample photo',
    });
  });

  it('ignores images inside voting buttons', () => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    image.src = 'https://example.com/poll-option.jpg';
    image.alt = 'Poll option';
    button.appendChild(image);

    expect(resolveImageZoomTarget(image)).toBeNull();
  });

  it('ignores images without a usable source', () => {
    const image = document.createElement('img');
    image.alt = 'Missing src';

    expect(resolveImageZoomTarget(image)).toBeNull();
  });
});
