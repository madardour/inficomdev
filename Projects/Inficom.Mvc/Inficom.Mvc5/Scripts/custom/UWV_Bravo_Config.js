﻿// This js file contains the public autocorrection list 
// This object is a key value pair collection and will be used in the autocorrect plugin of ckeditor in the config section of that plugin

// Set the namespace
var uwvBravo = uwvBravo || {};


//Base url
var BASE_URL = $('base').attr('url');

//Ckeditor base path
var CKEDITOR_BASEPATH = BASE_URL + 'Scripts/ckeditor/';
var CKEDITOR_TITLE = ($('base').attr('ckeditortitle') != undefined && $('base').attr('ckeditortitle').toLowerCase() == 'true');
var CONN_INTERVAL = $('base').attr('connectioncheck');
var AUTOSAVE_INTERVAL = $('base').attr('autosaveinterval') != "" ? $('base').attr('autosaveinterval') : 600000;

// autocorrectPublic configureert de publieke autocorrectielijst
uwvBravo.autocorrectPublic = {
    "à priori": "a priori",
    "a propos": "à propos",
    "aa nde": "aan de",
    "aa nhet": "aan het",
    "aand e": "aan de",
    "aanh et": "aan het",
    "aanrijken": "aanreiken",
    "abbonnee": "abonnee",
    "abbonnement": "abonnement",
    "abcent": "absent",
    "abusiefelijk": "abusievelijk",
    "accomodatie": "accommodatie",
    "acorderen": "accorderen",
    "adendum": "addendum",
    "aggressie": "agressie",
    "agregaat": "aggregaat",
    "akademikus": "academicus",
    "aksepteren": "accepteren",
    "all in": "all-in",
    "all risk": "allrisk",
    "alledrie": "alle drie",
    "alleenzijn": "alleen-zijn",
    "altans": "althans",
    "amandement": "amendement",
    "anderzins": "anderszins",
    "apartement": "appartement",
    "apengapen": "apegapen",
    "apiritief": "aperitief",
    "applaudiseren": "applaudisseren",
    "asperine": "aspirine",
    "bal masqués": "bals masqués",
    "barbecuen": "barbecueën",
    "barbeque": "barbecue",
    "barriëre": "barrière",
    "beamte": "beambte",
    "bedriegelijk": "bedrieglijk",
    "bedrijfsschap": "bedrijfschap",
    "berengoed": "beregoed",
    "bi jde": "bij de",
    "bi jhet": "bij het",
    "bijd e": "bij de",
    "bijh et": "bij het",
    "bonefide": "bonafide",
    "boorde af": "boordde af",
    "brilliant": "briljant",
    "buiten keif": "buiten kijf",
    "bungee jumping": "bungeejumping",
    "burgelijk": "burgerlijk",
    //"CAO": "cao",
    "carriëre": "carrière",
    "commité": "comité",
    "concureren": "concurreren",
    "contrôle": "controle",
    "dichtsbijzijnde": "dichtstbijzijnde",
    "doo rde": "door de",
    "doo rhet": "door het",
    "doord e": "door de",
    "doorh et": "door het",
    "down load": "download",
    "eenderde": "een derde",
    "electriciteit": "elektriciteit",
    "enigzins": "enigszins",
    "ergenis": "ergernis",
    "ethnisch": "etnisch",
    "extravegant": "extravagant",
    "fabricant": "fabrikant",
    "fabrikaat": "fabricaat",
    "faillisement": "faillissement",
    "falikant": "faliekant",
    "feitenlijk": "feitelijk",
    "frusteren": "frustreren",
    "geboortenbeperking": "geboortebeperking",
    "gedistileerd": "gedistilleerd",
    "gerechterlijke": "gerechtelijke",
    "gevoegelijk": "gevoeglijk",
    "geweldadig": "gewelddadig",
    "gezamelijk": "gezamenlijk",
    "goededag": "goedendag",
    "hardstikke": "hartstikke",
    "hartelust": "hartenlust",
    "havo'er": "havoër",
    "hoogelijk": "hooglijk",
    "hopenlijk": "hopelijk",
    "houwvast": "houvast",
    "hte": "het",
    "http:\\": "http://",
    "i nde": "in de",
    "i nhet": "in het",
    "ind e": "in de",
    "inh et": "in het",
    "insekt": "insect",
    "interesant": "interessant",
    "intervieuw": "interview",
    "kadet": "cadet",
    "kado": "cadeau",
    "krediteren": "crediteren",
    "leiddraad": "leidraad",
    "lokatie": "locatie",
    "me tde": "met de",
    "me thet": "met het",
    "metd e": "met de",
    "meth et": "met het",
    "metter tijd": "mettertijd",
    "milimeter": "millimeter",
    "millard": "miljard",
    "millieu": "milieu",
    "minitieus": "minutieus",
    "n ade": "na de",
    "n aeen": "na een",
    "n ahet": "na het",
    "naa rde": "naar de",
    "naa reen": "naar een",
    "naa rhet": "naar het",
    "naard e": "naar de",
    "naare en": "naar een",
    "naarh et": "naar het",
    "naas tde": "naast de",
    "naas teen": "naast een",
    "naas thet": "naast het",
    "naastd e": "naast de",
    "naasth et": "naast het",
    "nad e": "na de",
    "nae en": "na een",
    "nah et": "na het",
    "naijverig": "na-ijverig",
    "neit": "niet",
    "nochthans": "nochtans",
    "nummeriek": "numeriek",
    "o pde": "op de",
    "o phet": "op het",
    "onmiddelijk": "onmiddellijk",
    "onsteltenis": "ontsteltenis",
    "opd e": "op de",
    "oph et": "op het",
    "organizeren": "organiseren",
    "ove rde": "over de",
    "ove rhet": "over het",
    "overd e": "over de",
    "overh et": "over het",
    "permiteren": "permitteren",
    "procédé": "procedé",
    "produkt": "product",
    "reaktie": "reactie",
    "recencent": "recensent",
    "repressaille": "represaille",
    "rethorische": "retorische",
    "revenue": "revenu",
    "reïntegratie": "re-integratie",
    "sex": "seks",
    "stylistisch": "stilistisch",
    "sumier": "summier",
    "tafreel": "tafereel",
    "tax": "taks",
    "te voorschijn": "tevoorschijn",
    "ten harent": "te harent",
    "ten hunnent": "te hunnent",
    "ten mijnent": "te mijnent",
    "ten onzent": "te onzent",
    "ter gehore": "ten gehore",
    "ter geschenke": "ten geschenke",
    "ter strengste": "ten strengste",
    "terwille van": "ter wille van",
    "text": "tekst",
    "uitwijden": "uitweiden",
    "va nde": "van de",
    "va nhet": "van het",
    "vand e": "van de",
    "vanh et": "van het",
    "voo rde": "voor de",
    "voo reen": "voor een",
    "voo rhet": "voor het",
    "voord e": "voor de",
    "voore en": "voor een",
    "voorh et": "voor het",
    "voorwensel": "voorwendsel",
    "weekeinden": "weekenden",
    "wezelijk": "wezenlijk",
    "woordvoerdster": "woordvoerster",
    "zwartwitfoto": "zwart-witfoto"
};

// acceptUnicodesRegEx conifugureert welke unicode characters bij het plakken worden geaccepteerd.
// OP dit moment worden alle chararecters die ondersteund worden door het verdeana font geaccepteerd.
uwvBravo.acceptUnicodesRegEx = /^[\u0009\u000A\u000D\u0020\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002A\u002B\u002C\u002D\u002E\u002F\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039\u003A\u003B\u003C\u003D\u003E\u003F\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049\u004A\u004B\u004C\u004D\u004E\u004F\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059\u005A\u005B\u005C\u005D\u005E\u005F\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069\u006A\u006B\u006C\u006D\u006E\u006F\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079\u007A\u007B\u007C\u007D\u007E\u00A0\u00A1\u00A2\u00A3\u00A4\u00A5\u00A6\u00A7\u00A8\u00A9\u00AA\u00AB\u00AC\u00AD\u00AE\u00AF\u00B0\u00B1\u00B2\u00B3\u00B4\u00B5\u00B6\u00B7\u00B8\u00B9\u00BA\u00BB\u00BC\u00BD\u00BE\u00BF\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C6\u00C7\u00C8\u00C9\u00CA\u00CB\u00CC\u00CD\u00CE\u00CF\u00D0\u00D1\u00D2\u00D3\u00D4\u00D5\u00D6\u00D7\u00D8\u00D9\u00DA\u00DB\u00DC\u00DD\u00DE\u00DF\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E6\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F0\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F7\u00F8\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF\u0100\u0101\u0102\u0103\u0104\u0105\u0106\u0107\u0108\u0109\u010A\u010B\u010C\u010D\u010E\u010F\u0110\u0111\u0112\u0113\u0114\u0115\u0116\u0117\u0118\u0119\u011A\u011B\u011C\u011D\u011E\u011F\u0120\u0121\u0122\u0123\u0124\u0125\u0126\u0127\u0128\u0129\u012A\u012B\u012C\u012D\u012E\u012F\u0130\u0131\u0132\u0133\u0134\u0135\u0136\u0137\u0138\u0139\u013A\u013B\u013C\u013D\u013E\u013F\u0140\u0141\u0142\u0143\u0144\u0145\u0146\u0147\u0148\u0149\u014A\u014B\u014C\u014D\u014E\u014F\u0150\u0151\u0152\u0153\u0154\u0155\u0156\u0157\u0158\u0159\u015A\u015B\u015C\u015D\u015E\u015F\u0160\u0161\u0162\u0163\u0164\u0165\u0166\u0167\u0168\u0169\u016A\u016B\u016C\u016D\u016E\u016F\u0170\u0171\u0172\u0173\u0174\u0175\u0176\u0177\u0178\u0179\u017A\u017B\u017C\u017D\u017E\u017F\u018F\u0192\u01A0\u01A1\u01AF\u01B0\u01FA\u01FB\u01FC\u01FD\u01FE\u01FF\u0218\u0219\u021A\u021B\u0237\u0259\u02C6\u02C7\u02C9\u02D8\u02D9\u02DA\u02DB\u02DC\u02DD\u0300\u0301\u0302\u0303\u0306\u0308\u0309\u030B\u030C\u0323\u0326\u0333\u0347\u037E\u0384\u0385\u0386\u0387\u0388\u0389\u038A\u038C\u038E\u038F\u0390\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03AA\u03AB\u03AC\u03AD\u03AE\u03AF\u03B0\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03C9\u03CA\u03CB\u03CC\u03CD\u03CE\u03D6\u0401\u0402\u0403\u0404\u0405\u0406\u0407\u0408\u0409\u040A\u040B\u040C\u040D\u040E\u040F\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044A\u044B\u044C\u044D\u044E\u044F\u0451\u0452\u0453\u0454\u0455\u0456\u0457\u0458\u0459\u045A\u045B\u045C\u045D\u045E\u045F\u0478\u0479\u047C\u047D\u0487\u0490\u0491\u0492\u0493\u0496\u0497\u049A\u049B\u049C\u049D\u04A2\u04A3\u04A8\u04A9\u04AC\u04AD\u04AE\u04AF\u04B0\u04B1\u04B2\u04B3\u04B4\u04B5\u04B8\u04B9\u04BA\u04BB\u04BC\u04BD\u04BE\u04BF\u04D8\u04D9\u04E8\u04E9\u04F6\u04F7\u051A\u051B\u051C\u051D\u0531\u0532\u0533\u0534\u0535\u0536\u0537\u0538\u0539\u053A\u053B\u053C\u053D\u053E\u053F\u0540\u0541\u0542\u0543\u0544\u0545\u0546\u0547\u0548\u0549\u054A\u054B\u054C\u054D\u054E\u054F\u0550\u0551\u0552\u0553\u0554\u0555\u0556\u0559\u055A\u055B\u055C\u055D\u055E\u055F\u0561\u0562\u0563\u0564\u0565\u0566\u0567\u0568\u0569\u056A\u056B\u056C\u056D\u056E\u056F\u0570\u0571\u0572\u0573\u0574\u0575\u0576\u0577\u0578\u0579\u057A\u057B\u057C\u057D\u057E\u057F\u0580\u0581\u0582\u0583\u0584\u0585\u0586\u0587\u0589\u058A\u058F\u0E3F\u1E80\u1E81\u1E82\u1E83\u1E84\u1E85\u1E9E\u1EA0\u1EA1\u1EA2\u1EA3\u1EA4\u1EA5\u1EA6\u1EA7\u1EA8\u1EA9\u1EAA\u1EAB\u1EAC\u1EAD\u1EAE\u1EAF\u1EB0\u1EB1\u1EB2\u1EB3\u1EB4\u1EB5\u1EB6\u1EB7\u1EB8\u1EB9\u1EBA\u1EBB\u1EBC\u1EBD\u1EBE\u1EBF\u1EC0\u1EC1\u1EC2\u1EC3\u1EC4\u1EC5\u1EC6\u1EC7\u1EC8\u1EC9\u1ECA\u1ECB\u1ECC\u1ECD\u1ECE\u1ECF\u1ED0\u1ED1\u1ED2\u1ED3\u1ED4\u1ED5\u1ED6\u1ED7\u1ED8\u1ED9\u1EDA\u1EDB\u1EDC\u1EDD\u1EDE\u1EDF\u1EE0\u1EE1\u1EE2\u1EE3\u1EE4\u1EE5\u1EE6\u1EE7\u1EE8\u1EE9\u1EEA\u1EEB\u1EEC\u1EED\u1EEE\u1EEF\u1EF0\u1EF1\u1EF2\u1EF3\u1EF4\u1EF5\u1EF6\u1EF7\u1EF8\u1EF9\u200C\u200D\u200E\u200F\u2012\u2013\u2014\u2015\u2017\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2020\u2021\u2022\u2026\u2028\u2029\u202A\u202B\u202C\u202D\u202E\u202F\u2030\u2032\u2033\u2034\u2039\u203A\u203C\u203E\u2044\u206A\u206B\u206C\u206D\u206E\u206F\u2070\u2074\u2075\u2076\u2077\u2078\u2079\u207F\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089\u20A0\u20A1\u20A2\u20A3\u20A4\u20A5\u20A6\u20A7\u20A8\u20A9\u20AA\u20AB\u20AC\u20AD\u20AE\u20AF\u20B0\u20B1\u20B2\u20B3\u20B4\u20B5\u20B8\u20B9\u20F0\u2105\u2113\u2116\u2120\u2122\u2126\u212E\u215B\u215C\u215D\u215E\u2202\u2206\u220F\u2211\u2212\u2215\u2219\u221A\u221E\u222B\u2248\u2260\u2261\u2264\u2265\u2500\u2502\u250C\u2510\u2514\u2518\u25A1\u25AA\u25AB\u25CA\u25CF\u25E6\u266A\u2C6D\u2C71\u2C72\u2C73\uA71B\uA71C\uA71D\uA71E\uA71F\uA788\uA789\uA78A\uA78B\uA78C\uFB00\uFB01\uFB02\uFB03\uFB04\uFB13\uFB14\uFB15\uFB16\uFB17\uFFE5\uFFE6\uFFFD]+$/;

