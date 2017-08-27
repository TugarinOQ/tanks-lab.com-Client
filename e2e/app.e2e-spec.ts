import { OILMANPage } from './app.po';

describe('oilman App', () => {
  let page: OILMANPage;

  beforeEach(() => {
    page = new OILMANPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
