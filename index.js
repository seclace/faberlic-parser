import Osmosis from 'osmosis';
import excel from 'excel4node';
import listingMapping from './modules/listing-mapping';
import querystring from 'querystring';

const wb = new excel.Workbook();
const baseUrl = "http://706888674.shop.faberlic.com";

const style = wb.createStyle({
  font: {
    color: '#FF0800',
    size: 12
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -'
});

const ws = wb.addWorksheet('Sheet 1');
// ws.cell(1, 1).string('Категория').style(style);
ws.cell(1, 1).string('Изображение подкатегории').style(style);
ws.cell(1, 2).string('Подкатегория').style(style);
ws.cell(1, 3).string('Ссылка на товар').style(style);
ws.cell(1, 4).string('Ссылка на изображение').style(style);
ws.cell(1, 5).string('Название').style(style);
ws.cell(1, 6).string('Описание').style(style);
ws.cell(1, 7).string('Цена').style(style);
ws.cell(1, 8).string('Артикул').style(style);
ws.cell(1, 9).string('Ссылки на мини изображения').style(style);

let rowCount = 2;

let arLinks = [];
let arLinksLvl2 = [];

Osmosis
  .get('http://706888674.shop.faberlic.com/component/catalog/?view=category&idcategory=1000175334795')
  .find('.item-category-img a')
  .set({ link: '@href', img: 'img@src' })
  .follow('@href')
  .find('.page-header > h1')
  .set('title')
  .data(listing => {
    // console.log(listing);
    arLinks.push({link: baseUrl+listing.link, subCategoryImage: listing.img, title: listing.title });
  })
  .done(() => {
    console.log('Links found!');
    console.log(arLinks);
    arLinks.forEach(({link, subCategoryImage, title}) => {
      const queryParams = querystring.decode(link.split('?')[1]);
      if (queryParams.view === 'listgoods') {
        Osmosis
          .get(link, { limititems: 'all' })
          .find('.goodsitem-img a.goods-detail-link')
          .set({
            link: '@href',
            image: 'img@src',
          })
          .follow('@href')
          .delay(2)
          .set({
            title: '.page-header > h1',
            description: '#accordiongoods-collapse-0 .panel-body',
            price: '.goods-price-amount > span',
            article: '.goods-article > span',
            thumbs: ['.goods-itemsupergoods img@src, .copyright > div[1]'],
          })
          .data(listing => {
            let index = 1;
            // console.log(listing);
            ws.cell(rowCount, index++).string(listingMapping['subCategoryImage'](subCategoryImage));
            ws.cell(rowCount, index++).string(listingMapping['subCategoryTitle'](title));
            Object.keys(listing).forEach(key => {
                ws.cell(rowCount, index++).string(listingMapping[key](listing[key]));
            });
            rowCount++;
          })
          .done(() => {
            console.log('Os done!');
          })
          .log(console.log)
          .error(console.log);
          // os.debug(console.log);
      } else if (queryParams.view === 'category') {
        Osmosis
          .get(link)
          .find('.item-category-desc a')
          .set({ link: '@href' })
          .data(listing => {
            arLinksLvl2.push(baseUrl+listing.link);
          })
          .done(() => {
            console.log('Links for level 2 found!');
            console.log(arLinksLvl2);
            arLinksLvl2.forEach(linkLvl2 => {
              Osmosis
                .get(linkLvl2, { limititems: 'all' })
                .find('.goodsitem-img a.goods-detail-link')
                .set({
                  link: '@href',
                  image: 'img@src',
                })
                .follow('@href')
                .delay(2)
                .set({
                  title: '.page-header > h1',
                  description: '#accordiongoods-collapse-0 .panel-body',
                  price: '.goods-price-amount > span',
                  article: '.goods-article > span',
                  thumbs: ['.goods-itemsupergoods img@src, .copyright > div[1]'],
                })
                .data(listing => {
                  let index = 1;
                  // console.log(listing);
                  ws.cell(rowCount, index++).string(listingMapping['subCategoryImage'](subCategoryImage));
                  ws.cell(rowCount, index++).string(title);
                  Object.keys(listing).forEach(key => {
                      ws.cell(rowCount, index++).string(listingMapping[key](listing[key]));
                  });
                  rowCount++;
                })
                .done(() => {
                  console.log('Os lvl2 done!');
                  wb.write('faberlic.xlsx');
                })
                .log(console.log)
                .error(console.log);
              // os.debug(console.log);
            })
          })
      }
    });
  })
;