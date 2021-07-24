const { FileMode, QFileDialog, QKeySequence, QAction, QMenuBar, QComboBox, QLineEdit, QLabel,
    FlexLayout, QWidget, QMainWindow,
    QPushButton, QTextEdit
} = require('@nodegui/nodegui');

const puppeteer = require('puppeteer');
var rl = require('readline')
const fs = require('fs').promises;

var browser: any;
var currentWebsite:any;

//Root view
const rootView = new QWidget();
const rootViewLayout = new FlexLayout();
rootView.setLayout(rootViewLayout);
rootView.setObjectName("rootView");

//Menubar
const menu = new QMenuBar();
menu.setObjectName("menu");
const language = menu.addMenu("Language");
const frenchAction = new QAction();
const germanAction = new QAction();
const englishAction = new QAction();
frenchAction.setText("french");
germanAction.setText("german");
englishAction.setText("english");
germanAction.setShortcut(new QKeySequence(`D`));
frenchAction.setShortcut(new QKeySequence(`F`));
englishAction.setShortcut(new QKeySequence(`E`));

language.addAction(frenchAction);
language.addAction(englishAction);
language.addAction(germanAction);



//Fieldset
const fieldset = new QWidget();
const fieldsetLayout = new FlexLayout();
fieldset.setObjectName("fieldset");
fieldset.setLayout(fieldsetLayout);

//Row 1
const visitSiteRow = new QWidget();
const visitSiteRowLayout = new FlexLayout();
visitSiteRow.setObjectName("visitSiteRow");
visitSiteRow.setLayout(visitSiteRowLayout);

const lblChoseSite = new QLabel();
lblChoseSite.setObjectName("lblChoseSite");

const btnOpenAtHome = new QPushButton();
btnOpenAtHome.setObjectName("btnOpenAtHome");
visitSiteRowLayout.addWidget(btnOpenAtHome);

const btnOpenImmotop = new QPushButton();
btnOpenImmotop.setObjectName("btnOpenImmotop");
visitSiteRowLayout.addWidget(btnOpenImmotop);

const lblResultPages = new QLabel();
lblResultPages.setObjectName("lblResultPages");

const lnEdtResultPages = new QLineEdit();
lnEdtResultPages.setObjectName("lnEdtResultPages");
const lblChooseFormat = new QLabel();
lblChooseFormat.setObjectName("lblChooseFormat");
const cbFileFormat = new QComboBox();
cbFileFormat.setObjectName("cbFileFormat");
const btnGo = new QPushButton();
btnGo.setObjectName("btnGo");

btnOpenAtHome.setText("AtHome.lu");
btnOpenImmotop.setText("Immotop.lu");
btnGo.setText("Save Pages");

lblChoseSite.setText("Press Button to visit Immotop or AtHome");
lblResultPages.setText("Choose number of pages to save");
lblChooseFormat.setText("Choose Save File Format");

cbFileFormat.addItem(undefined, 'Office Word (*.docx)');
cbFileFormat.addItem(undefined, 'Text File (*.txt)');
cbFileFormat.setObjectName("cbFileFormat");
var format: string = '.docx';

cbFileFormat.addEventListener('currentTextChanged', (text:any) => {
    if (text == 'Office Word (*.docx)')
        format = '.docx';
    else if (text == 'Text File (*.txt)')
        format = '.txt';
});


btnOpenImmotop.addEventListener('clicked', async () => {
    try {
        await visitWebsite("immotop");
        currentWebsite = "immotop";
    } catch (e) {
        console.log(e);
    }


});
btnOpenAtHome.addEventListener('clicked', async () => {
    try {
        await visitWebsite("athome");
        currentWebsite = "athome";
    } catch (e) {
        console.log(e);
    }
});



btnGo.addEventListener('clicked', async () => {
    try {
        const fileDialog = new QFileDialog();
        fileDialog.setFileMode(FileMode.Directory);
        fileDialog.exec();
        const selectedFiles = fileDialog.selectedFiles();
        var path = selectedFiles[0];
        var sites = lnEdtResultPages.text();
        if (currentWebsite == "immotop")
            await scrapeProductImmotop(sites, selectedFiles[0] + '\\immotop' + format);
        else if (currentWebsite == "athome")
            await scrapeProductAtHome(sites, selectedFiles[0] + '\\atHome' + format);
    } catch (e) {
        console.log(e);
    }
});

germanAction.addEventListener("triggered", () => {
    frenchAction.setText("Franzoesisch");
    germanAction.setText("Deutsch");
    englishAction.setText("Englisch");
    //language.setText("Sprache");
    btnGo.setText("Seiten speichern");
    lblChoseSite.setText("Klicke Button um Immotop oder AtHome zu besuchen");
    lblResultPages.setText("Waehle die Anzahl der Seiten zum speichern");
    lblChooseFormat.setText("Waehle ein Speicherformat");
});

frenchAction.addEventListener("triggered", () => {
    frenchAction.setText("Francais");
    germanAction.setText("Allemand");
    englishAction.setText("Anglais");
    //language.setText("Langue");
    btnGo.setText("Sauvegarder pages du site");
    lblChoseSite.setText("Appuiez sur le bouton pour visiter Immotop oder AtHome");
    lblResultPages.setText("Choisissez le nombre de pages a sauvegarder");
    lblChooseFormat.setText("Choisissez un format de sauvegarde");
});

englishAction.addEventListener("triggered", () => {
    frenchAction.setText("French");
    germanAction.setText("German");
    englishAction.setText("English");
    //language.setText("Language");
    btnGo.setText("Save Pages");
    lblChoseSite.setText("Press Button to visit Immotop or AtHome");
    lblResultPages.setText("Choose number of pages to save");
    lblChooseFormat.setText("Choose Save File Format");
});


lnEdtResultPages.setPlaceholderText("1 - 10000");


fieldsetLayout.addWidget(lblChoseSite);
fieldsetLayout.addWidget(visitSiteRow);
fieldsetLayout.addWidget(lblResultPages);
fieldsetLayout.addWidget(lnEdtResultPages);
fieldsetLayout.addWidget(lblChooseFormat);
fieldsetLayout.addWidget(cbFileFormat);
fieldsetLayout.addWidget(btnGo);
rootViewLayout.addWidget(fieldset);

rootView.setStyleSheet(`
  * {
    color: rgb(96,96,96);
    font-size: 20px;
    }
  #menu.button  {
    color: rgb(96,96,96);
    font-weight: bold;
    font-size: 20px;
  }
  #rootView {
    padding: 5px;
    background-color: #E8E8E8;
  }
  #fieldset {
    padding: 10px;
    border: 2px ridge #bdbdbd;
    margin-bottom: 4px;
    background-color: white;
  }
  #visitSiteRow {
    flex-direction: row;
    margin-bottom: 5px;
  }
  #btnOpenAtHome, #btnOpenImmotop, #btnGo, #cbFileFormat {
    
    background-color: #E8E8E8;
  }

`);

const win = new QMainWindow();
win.setWindowTitle("Real Estate Scraper");
win.setMenuBar(menu);
win.setCentralWidget(rootView);
win.show();
(global as any).win = win;



async function visitWebsite(name: any)
{
        browser = await puppeteer.launch({
            executablePath: 'C:/Users/tomba/source/repos/ImmoNodeGui/src/chromium/chrome.exe',
            headless: false,
            product: 'chrome',
            defaultViewport: null
        });
        const page = (await browser.pages())[0];

        if (name.includes("immotop")) {
            await page.goto("https://www.immotop.lu/de/search/");
        }
        else if (name.includes("athome")) {
            await page.goto("https://www.athome.lu");
        }

} 


async function scrapeProductAtHome(amountSites: any,  dir: any) {
    var page = (await browser.pages())[0];
    var resultNumber:number = 1;
    const url = page.url();
    for (var i = 1; i <= amountSites; i++) {
        const nextUrl = url + "&page=" + i;
        await page.goto(nextUrl);

        for (var listing = 2; listing <= 26; listing++) {
            const titleAddress = "/html/body/div[1]/div/div/section/div[1]/div/div[" + listing + "]/article/div/h3/a";
            const priceTagAddress = "/html/body/div[1]/div/div/section/div[1]/div/div[" + listing + "]/article/div/ul[1]/li/span";

            try {
                const [el1] = await page.$x(titleAddress);
                const [el2] = await page.$x(priceTagAddress);

                const link = await el1.getProperty('href');
                const title = await el1.getProperty('textContent');
                const price = await el2.getProperty('textContent');

                const rawLink = await link.jsonValue();
                const rawTitle = await title.jsonValue();
                const rawPrice = await price.jsonValue();

                var textBlockAtHome:any = textBlockAtHome + resultNumber + ".\n" + rawTitle + "\n" + rawPrice + "\n" + rawLink + "\n" + "\n";
                resultNumber++
            }
            catch (err) {
                //do nothing
            }
        }
        page = await browser.newPage();
    }
    try {
        await fs.writeFile(dir, textBlockAtHome);
    }
    catch (error) {
        console.log(error);
    }
    await browser.close();
}


async function scrapeProductImmotop(amountSites: number, dir: any) {
    console.log(dir);
    var resultNumber:number = 1;
    var page = (await browser.pages())[0];
    var textBlockImmotop: any = "";
    for (var i = 1; i <= amountSites; i++) {

        const nextUrl = "https://www.immotop.lu/search" + "/index" + i + ".html";
        await page.goto(nextUrl);


        for (var listing = 3; listing <= 21; listing++) {
                const titleAddress = "/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[4]/div[" + listing + "]/div/div[2]/p/a" //CONTAINS TITLE AND LINK
                const priceTagAddress = "/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[4]/div[" + listing + "]/div/div[2]/div[1]/div[1]/nobr/text()" //CONTAINS PRICE                    
                try {
                    const [el1] = await page.$x(titleAddress);
                    const [el2] = await page.$x(priceTagAddress);

                    const link = await el1.getProperty('href');
                    const title = await el1.getProperty('textContent');
                    const price = await el2.getProperty('textContent');

                    const rawLink = await link.jsonValue();
                    const rawTitle = await title.jsonValue();
                    const rawPrice = await price.jsonValue();

                    textBlockImmotop = textBlockImmotop + "" + resultNumber + ".\n" + rawTitle + "\n" + rawPrice + "\n" + rawLink + "\n" + "\n";
                    resultNumber++
                }
                catch (err) {
                    try {
                        const titleAddress = "/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[4]/div[" + listing + "]/div/div/div/div[2]/p/a" //CONTAINS TITLE AND LINK
                        const priceTagAddress = "/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[4]/div[" + listing + "]/div/div/div/div[2]/div[1]/div/nobr/text()" //CONTAINS PRICE

                        const [el1] = await page.$x(titleAddress);
                        const [el2] = await page.$x(priceTagAddress);

                        const link = await el1.getProperty('href');
                        const title = await el1.getProperty('textContent');
                        const price = await el2.getProperty('textContent');

                        const rawLink = await link.jsonValue();
                        const rawTitle = await title.jsonValue();
                        const rawPrice = await price.jsonValue();

                        textBlockImmotop = textBlockImmotop + "" + resultNumber + ".\n" + rawTitle + "\n" + rawPrice + "\n" + rawLink + "\n" + "\n";
                        resultNumber++
                    } catch (err2) {
                        //do nothing
                    }
                }

        }
        page = await browser.newPage();
    }
    try {
        await fs.writeFile(dir, textBlockImmotop);
    } catch (error) {
        console.log(error)
    }
    await browser.close();
}

async function getTypeCityCountry(title: any) {
    var land
    var typImmobilie = "undefined"
    var stadt = "undefined" 
    if (title.includes("(BE)")) {
        land = "Belgien"
    }
    else if (title.includes("(FR)")) {
        land = "Frankreich"
    }
    else if (title.includes("(DE)")) {
        land = "Deutschland"
    }
    else {
        land = "Luxemburg"
    }
    typImmobilie = title.substr(0, title.indexOf('zu verkaufen') - 1)
    stadt = title.substr(title.indexOf(' in ') + 4, title.length)
    if (stadt.includes("(FR)") || stadt.includes("(DE)") || stadt.includes("BE")) {
        stadt = stadt.substr(0, stadt.length - 5)
    }
    return [typImmobilie, stadt, land]
}


