import isArray from 'lodash.isarray';

const baseUrl = "http://706888674.shop.faberlic.com";

function getFullImageUrl( url ) {
  const reg = new RegExp('(.*)(_detail|_thumb)(.*)', 'ig');
  if (!isArray(url)) return url.replace(reg, '$1_pic$3');
  return url.map(u => u.replace(reg, '$1_pic$3'));
}

function getThumbs( thumbs ) {
  const testCopyright = new RegExp('copy.*','ig');
  const newThumbs = thumbs.slice().filter(item => !testCopyright.test(item));
  return newThumbs.map((thumb, i) => getFullImageUrl(thumb));
}

const listingMapping = {
  category: category => String(category),
  subCategoryTitle: subCategoryTitle => String(subCategoryTitle),
  subCategoryImage: subCategoryImage => String(baseUrl + subCategoryImage),
  link: link => String(baseUrl + link),
  image: image => String(getFullImageUrl(image)),
  title: title => String(title),
  description: description => String(description),
  price: price => String(price),
  article: article => String(article),
  thumbs: thumbs => String(getThumbs(thumbs)),
};

export default listingMapping;