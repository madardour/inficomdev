using Newtonsoft.Json;
using OpenXmlTools;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.IO;
using System.Linq;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;
using System.Xml.XPath;
using UWV.BRAVO.DAL.Contexts;
using UWV.BRAVO.DAL.Interfaces;
using UWV.BRAVO.DAL.Repositories;
using UWV.BRAVO.Domain;
using UWV.BRAVO.Domain.Document;
using UWV.BRAVO.Domain.Enums;
using UWV.BRAVO.Domain.Rekentool;
using UWV.BRAVO.RAPTOR.BravoReport;
using UWV.BRAVO.RAPTOR.Models;
using UWV.BRAVO.RAPTOR.Services;

namespace ConsoleApplication
{
    class Program
    {
        readonly static DocumentContext context = new DocumentContext();
        readonly static TemplateRepository _templateRepository = new TemplateRepository(context);
        readonly static DocumentRepository _documentRepository = new DocumentRepository(context);
        // readonly static BravoXmlTemplate _bravoXmlTemplate = new BravoXmlTemplate();

        static void Main(string[] args)
        {
            try
            {
                //ParseXML();
                //GetDocument();
                //GetJson();
                //GetCaseDocument();
                //GetIkvSet();
                //DeleteHim();
                //DeletePVC();
                //LockCase();
                //GetDiagnoseJsonData();
                //ValidateXml();
                //Bravo();

                InkomstenVerhoudingenSet ikvSet = context.InkomstenVerhoudingenSets.Where(i => i.Id == 402)
                .Include(mml => mml.MaatManResultaat)
                .Include(pvc => pvc.PraktischeVerdienCapaciteitResultaat).FirstOrDefault();

                context.Entry(ikvSet)
                .Collection(x => x.InkomstenVerhoudingen).Query().OrderBy(ikv => ikv.InkomstenVerhoudingId)
                .Include(a => a.InkomstenOpgaven)
                .Include(b => b.GegevensPerioden)
                .Include(c => c.CbsIndices)
                .Include(e => e.MaatManLoon)
                .Load();

                Console.WriteLine("Done");
                Console.ReadKey();
            }
            catch (Exception ex)
            {
                // log exception                
                Console.WriteLine(ex.ToString());
                Console.ReadKey();
            }
        }

        public static void Bravo()
        {
            try
            {
                BravoDocument bravoDocument = _documentRepository.GetBravoDocumentExtended("de088238-f7f4-4783-afba-7d998c6c8a8e");
                string xmlFile = @"E:\\Users\\Mad\Git\\Bravo\\UWV.BRAVO.RAPTOR\\Data\\DataBRaVo_template.xml";
                string xsdPath = @"E:\\Users\\Mad\Git\\Bravo\\UWV.BRAVO.RAPTOR\\Data\\DataBraVo.xsd";
               
                XmlDocument newXml = new XmlDocument();
                newXml.Load(xmlFile);
                newXml.Schemas.Add(null, xsdPath);

                try
                {
                    XmlDocument xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(bravoDocument.BravoDocumentExtended.DocumentXmlVariables);

                    XElement docVarsSource = XElement.Parse(bravoDocument.BravoDocumentExtended.DocumentXmlVariables);
                    XElement docVarsTarget = XElement.Parse(newXml.OuterXml);
                    

                    //var elements = docVarsTarget.XPathSelectElements("//*[normalize-space(text()) = '#']");
                    var elements = docVarsSource.Descendants().Where(descendent => !descendent.HasElements);
                    foreach (XElement el in elements)
                    {   
                        Console.WriteLine(el.Value);

                        if (el.Parent.GetXPath().Contains("["))
                        {
                            //Console.WriteLine(el.Parent.GetXPath());
                        }
                        else
                        {
                            XElement nodeTarget = docVarsTarget.XPathSelectElement(el.GetXPath().Replace("DataBRaVo", "."));
                            if (nodeTarget != null)
                            {
                                nodeTarget.SetValue(el.Value);
                            }
                        }
                        
                    }

                    newXml.LoadXml(docVarsTarget.ToString());
                    //Console.WriteLine(newXml.OuterXml);

                    //newXml.Validate(null);
                    //Console.WriteLine("valid");
                }
                catch (XmlSchemaValidationException ex)
                {
                    Console.WriteLine("not valid: " + ex.Message);
                }


            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

        }


        private static void ValidateXml()
        {
            string curDir = Environment.CurrentDirectory;
            string rootDir = Path.Combine(curDir, "..\\..\\TestData");
            Console.WriteLine(new Uri(rootDir).AbsolutePath);
            string xmlPath = Path.Combine(curDir.Replace("bin\\Debug", ""), "Xml");
            string xsdPath = Path.Combine(curDir.Replace("bin\\Debug", ""), "DataBraVo.xsd");

            foreach (string xmlFile in Directory.EnumerateFiles(xmlPath, "*.xml"))
            {
                XmlDocument xml = new XmlDocument();
                xml.Load(xmlFile);
                xml.Schemas.Add(null, xsdPath);

                try
                {
                    xml.Validate(null);
                    Console.WriteLine("valid:" + xmlFile);
                }
                catch (XmlSchemaValidationException ex)
                {
                    Console.WriteLine("not valid: " + ex.Message);
                }
            }

        }

        private static void GetDiagnoseJsonData()
        {

            var diagnoseModel = new Diagnosecodes();
            diagnoseModel.DiagnoseCodeSections = context.DiagnoseCodeSections.Distinct().ToList();
            diagnoseModel.DiagnoseCodes = context.DiagnoseCodes.Distinct().Take(1).ToList();
            diagnoseModel.DiagnoseCodes[0].DiagnoseCodeSectionId = 0;
            var diagnoseJsonData = JsonConvert.SerializeObject(diagnoseModel, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore, Formatting = Newtonsoft.Json.Formatting.Indented });

            //1258
            Console.WriteLine(diagnoseJsonData.Length);
        }

        private static int DoCalc()
        {
            var som = 20;
            var result = som / 0;
            return result;
        }

        private static T GetEnumValueFromXmlAttrName<T>(string attribVal)
        {
            var baseType = typeof(T).BaseType;
#pragma warning disable CS0219 // The variable 'val2' is assigned but its value is never used
            var val2 = default(T);
#pragma warning restore CS0219 // The variable 'val2' is assigned but its value is never used
            var val = Activator.CreateInstance<T>();
            //val = Enum.Parse()
            //Enum.TryParse(val.ToString(), out val3);

            if (baseType == null || !baseType.FullName.Equals("System.Enum"))
            {
                return val;
            }

            return val;
        }

        public static string ComposeErrorMessageByCode(string messageCode, Dictionary<string, string> replaceDictionary = null)
        {
            var errorMessage = string.Format("Ophalen melding met code '{0}' mislukt. Standaard foutmelding wordt getoond.", messageCode);

            string result = string.Empty;

            try
            {
                result = "Weet je zeker dat je tekstfragment met titel <PERSOONLIJK TEKSTBLOK.Titel tekstfragment> wilt verwijderen?";

                if (!string.IsNullOrWhiteSpace(result))
                {
                    if (replaceDictionary != null)
                    {
                        foreach (var item in replaceDictionary)
                        {
                            string searchItem = $"<{item.Key}>";
                            result = result.Replace(searchItem, item.Value);
                        }
                    }
                }
                else
                {
                    //MvcApplication.MyLogger.Error(errorMessage);
                    //result = cache.Get("M9999").ToString();
                }
            }
            catch (Exception)
            {
                //MvcApplication.MyLogger.Error(errorMessage);
            }
            return result;
        }

        static void DeletePVC()
        {
#pragma warning disable CS0219 // The variable 'caseId' is assigned but its value is never used
            int caseId = 1;
#pragma warning restore CS0219 // The variable 'caseId' is assigned but its value is never used
#pragma warning disable CS0219 // The variable 'typeIkvSet' is assigned but its value is never used
            var typeIkvSet = TypeInkomstenVerhoudingSet.PraktischeVerdienCapaciteit;
#pragma warning restore CS0219 // The variable 'typeIkvSet' is assigned but its value is never used
#pragma warning disable CS0219 // The variable 'codeHerkomst' is assigned but its value is never used
            var codeHerkomst = CodeHerkomstInkomstenVerhouding.Automatisch;
#pragma warning restore CS0219 // The variable 'codeHerkomst' is assigned but its value is never used
            int ikvId = 6;

            InkomstenVerhoudingenSet currentIkvSet = context.InkomstenVerhoudingenSets
                .Where(i => i.InkomstenVerhoudingen.Any(a => a.InkomstenVerhoudingId == ikvId))
                .Include(v => v.Case)
                .Include(v => v.InkomstenVerhoudingen).FirstOrDefault();

            //context.Entry(currentCase).Collection(f => f.InkomstenVerhoudingenSets).Query()
            //   .Include(v => v.InkomstenVerhoudingen.Select(c => c.WerkgeverGegevens)).Load();

            //InkomstenVerhouding ikv = currentCase.InkomstenVerhoudingenSets.First().InkomstenVerhoudingen?.FirstOrDefault(i => i.InkomstenVerhoudingId == ikvId);

            Console.WriteLine("klaar");
        }
        static void DeleteHim()
        {
            int caseId = 1;

            Case currentCase = context.Cases.Where(c => c.Id == caseId)
                .Include(c => c.HerindexeringMaatman)
                .Include(c => c.InkomstenVerhoudingenSets.Select(x => x.PraktischeVerdienCapaciteitResultaat)).AsEnumerable().Select(c => new Case()
                {
                    Id = c.Id,
                    HerindexeringMaatman = c.HerindexeringMaatman,
                    InkomstenVerhoudingenSets = c.InkomstenVerhoudingenSets.Where(i => i.TypeInkomstenVerhoudingSet == TypeInkomstenVerhoudingSet.PraktischeVerdienCapaciteit).ToList()
                }).FirstOrDefault();

            //Case currentCase = context.Cases.Where(c => c.Id == caseId)
            //           .Include(c => c.HerindexeringMaatman)
            //           .Include(c => c.InkomstenVerhoudingenSets)
            //           .Include(c => c.InkomstenVerhoudingenSets.Select(i => i.PraktischeVerdienCapaciteitResultaat))
            //           .FirstOrDefault();

            Console.WriteLine(currentCase.InkomstenVerhoudingenSets.Count);
            //Console.WriteLine(currentIkvSet.InkomstenVerhoudingen.First().WerkgeverGegevens.Naam);
            //context.SaveChanges();
        }

        static void GetIkvSet()
        {
            //var test = context.InkomstenVerhoudingenSets.AsQueryable().Include( i => i.InkomstenVerhoudingen)
            //    .Include( i => i.InkomstenVerhoudingen.Select( c => c.WerkgeverGegevens ))

            InkomstenVerhoudingenSet currentIkvSet = context.InkomstenVerhoudingenSets.AsQueryable()
                .Where(i => i.CaseId == 1 && i.TypeInkomstenVerhoudingSet == TypeInkomstenVerhoudingSet.MaatManLoon).FirstOrDefault();

            foreach (var ikv in currentIkvSet.InkomstenVerhoudingen.Where(x => x.CodeHerKomst == CodeHerkomstInkomstenVerhouding.Automatisch).ToList())
            {
                context.Entry(ikv).State = EntityState.Deleted;
            }

            //Console.WriteLine(currentIkvSet.InkomstenVerhoudingen.First().DatumBegin);
            //Console.WriteLine(currentIkvSet.InkomstenVerhoudingen.First().WerkgeverGegevens.Naam);
            context.SaveChanges();
        }

        static void GetDocument()
        {
            string processId = "4792e037-8969-477b-ae4b-3e0fb0209dba";
            IDocumentRepository _documentRepository = new DocumentRepository(context);

            BravoDocument bravoDocument = _documentRepository.GetBravoDocumentWithBinaryAndTemplateByMwsProcessId(processId);

            bravoDocument.Case.LaunchCodeId = null;
            bravoDocument.Case = null;

            Console.WriteLine(bravoDocument.Case.LaunchCodeId);

            if (bravoDocument == null || bravoDocument.Case == null || bravoDocument.Case.LaunchCodeId == null)
            {
                Console.WriteLine("Empty");
            }

        }

        static void GetCaseDocument()
        {
            string processId = "4792e037-8969-477b-ae4b-3e0fb0209dba";
            IDocumentRepository _documentRepository = new DocumentRepository(context);

            Console.WriteLine(context.Database.Connection.ConnectionString);

            //BravoDocument bravoDocument = context.Documents.FirstOrDefault(d => d.MwsProcessId == processId);
            //BravoDocument bravoDocument = _documentRepository.GetBravoDocumentInfoByMwsProcessId(processId);
            //BravoDocument bravoDocument = _documentRepository.GetBravoDocumentWithBinaryAndTemplateByMwsProcessId(processId);
            //BravoDocument bravoDocument = _documentRepository.GetDocumentMetaByMwsProcessId(processId);
            BravoDocument bravoDocument = _documentRepository.GetBravoDocumentWithBinaryAndTemplateByMwsProcessId(processId);

            XmlDocument xmldocBravoXml = new XmlDocument();
            xmldocBravoXml.LoadXml(bravoDocument.BravoDocumentExtended.DocumentXmlVariables);

            XmlDocument pdcManVarXml = new XmlDocument();
            pdcManVarXml.LoadXml(bravoDocument.BravoDocumentExtended.PdcManVarXml);

            //var pdcManVarsList = ReportHelpers.ManVarXmlToList(bravoDocument.BravoDocumentExtended.PdcManVarXml);
            //Console.WriteLine(pdcManVarsList.Any(var => var.DocumentVariableName == "tb_22_opleiding"));

            XElement xDocumentXmlVariables = bravoDocument.BravoDocumentExtended.XDocumentXmlVariables;
            var elements = xDocumentXmlVariables.XPathSelectElement("./HI").Elements();

            //IEnumerable<XElement> items = from el in xDocumentXmlVariables.Descendants("OPLEIDINGEN") select el;
            //foreach (XElement opl in items)
            //    Console.WriteLine(opl);

            //foreach (XElement e in elements.Descendants("opleiding").Where(e => e.Value != "#"))
            foreach (XElement hi in elements)
            {
                switch (hi.Name.ToString().ToUpper())
                {
                    case "OPLEIDINGEN":
                        foreach (XElement oe in hi.Elements())
                        {
                            oe.Descendants().Where(v => string.IsNullOrEmpty(v.Value.Trim())).ToList().ForEach(e => e.Value = "#");
                            if (oe.Descendants().Where(v => v.Value.Trim() != "#").Any())
                            {
                                Console.WriteLine(oe.Element("opleiding").Value);
                                Console.WriteLine(oe.Element("resultaat").Value);
                                Console.WriteLine(oe.Element("periode").Value);
                                Console.WriteLine("");
                            }
                        }
                        break;

                    case "STAGESX":
                        foreach (XElement se in hi.Elements().Descendants("functie").Where(se => se.Value != "#"))
                        {
                            Console.WriteLine(se.Parent.Element("functie").Value);
                        }
                        break;

                    case "OVERIGX":
                        foreach (XElement ve in hi.Elements().Descendants("mate").Where(ve => ve.Value != "@"))
                        {
                            Console.WriteLine(ve.Parent.Element("omschrijving").Value);
                        }
                        break;

                    default:
                        break;
                }

                //Console.WriteLine(e.Value);
            }

            //foreach (var docVar in pdcManVarsList)
            //{
            //    Console.WriteLine(docVar.DocumentVariableName);
            //}

            //Console.WriteLine(bravoDocument.DocumentId);

        }

        static void GetJson()
        {
            string data = "[{\"id\":\"MEC30_x1_EZWB\",\"text\":\"EZWB\",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x1_EZWB\",\"title\":\"EZWB\",\"name\":\"MEC30_x1_EZWB\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x1_EZWB_anchor\"},\"state\":{\"loaded\":true,\"opened\":true,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x11_EZWB\",\"text\":\"EZWB\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x11_EZWB\",\"title\":\"EZWB\",\"name\":\"MEC30_x11_EZWB\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x11_EZWB_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x12_EZWB_ERD\",\"text\":\"EZWB ERD\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x12_EZWB_ERD\",\"title\":\"EZWB ERD\",\"name\":\"MEC30_x12_EZWB_ERD\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x12_EZWB_ERD_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"},{\"id\":\"MEC30_x2_TVB2\",\"text\":\"TVB2\",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x2_TVB2\",\"title\":\"TVB2\",\"name\":\"MEC30_x2_TVB2\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x2_TVB2_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x21_TVB2\",\"text\":\"TVB2\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x21_TVB2\",\"title\":\"TVB2\",\"name\":\"MEC30_x21_TVB2\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x22_TVB2_ERD\",\"text\":\"TVB2_ERD\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x22_TVB2_ERD\",\"title\":\"TVB2_ERD\",\"name\":\"MEC30_x22_TVB2_ERD\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"},{\"id\":\"MEC30_x3_Eerste_claim\",\"text\":\"Eerste claim (per einde wachttijd) \",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x3_Eerste_claim\",\"title\":\"Eerste claim (per einde wachttijd)\",\"name\":\"MEC30_x3_Eerste_claim\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x3_Eerste_claim_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x31_WIA\",\"text\":\"WIA\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x31_WIA\",\"title\":\"WIA\",\"name\":\"MEC30_x31_WIA\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x32_WAO\",\"text\":\"WAO\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x32_WAO\",\"title\":\"WAO\",\"name\":\"MEC30_x32_WAO\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x33_WAZ\",\"text\":\"WAZ\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x33_WAZ\",\"title\":\"WAZ\",\"name\":\"MEC30_x33_WAZ\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"},{\"id\":\"MEC30_x4_Herziening_herbeoordeling\",\"text\":\"Herziening/herbeoordeling\",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x4_Herziening_herbeoordeling\",\"title\":\"Herziening/herbeoordeling\",\"name\":\"MEC30_x4_Herziening_herbeoordeling\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x4_Herziening_herbeoordeling_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x41_WIA_na_einde_wachttijd\",\"text\":\"WIA na einde wachttijd\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x41_WIA_na_einde_wachttijd\",\"title\":\"WIA na einde wachttijd\",\"name\":\"MEC30_x41_WIA_na_einde_wachttijd\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x42_WIA_herleving\",\"text\":\"WIA herleving\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x42_WIA_herleving\",\"title\":\"WIA herleving\",\"name\":\"MEC30_x42_WIA_herleving\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x43_WIA_herziening\",\"text\":\"WIA herziening\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x43_WIA_herziening\",\"title\":\"WIA herziening\",\"name\":\"MEC30_x43_WIA_herziening\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x44_WAO_na_einde_wachttijd\",\"text\":\"WAO na einde wachttijd\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x44_WAO_na_einde_wachttijd\",\"title\":\"WAO na einde wachttijd\",\"name\":\"MEC30_x44_WAO_na_einde_wachttijd\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x45_WAO_Amber\",\"text\":\"WAO AMBER\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x45_WAO_Amber\",\"title\":\"WAO AMBER\",\"name\":\"MEC30_x45_WAO_Amber\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x46_WAZ\",\"text\":\"WAZ\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x46_WAZ\",\"title\":\"WAZ\",\"name\":\"MEC30_x46_WAZ\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"},{\"id\":\"MEC30_x5_Aanvraag_voorziening\",\"text\":\"Aanvraag voorziening\",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x5_Aanvraag_voorziening\",\"title\":\"Aanvraag voorziening\",\"name\":\"MEC30_x5_Aanvraag_voorziening\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x5_Aanvraag_voorziening_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x51_Voorziening\",\"text\":\"Aanvraag voorziening\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x51_Voorziening\",\"title\":\"Aanvraag voorziening\",\"name\":\"MEC30_x51_Voorziening\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x52_Voortzetting_voorziening\",\"text\":\"Voortzetting voorziening\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x52_Voortzetting_voorziening\",\"title\":\"Voortzetting voorziening\",\"name\":\"MEC30_x52_Voortzetting_voorziening\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"},{\"id\":\"MEC30_x6_Overig\",\"text\":\"Overig\",\"icon\":\"glyphicon glyphicon-minus\",\"li_attr\":{\"id\":\"MEC30_x6_Overig\",\"title\":\"Overig\",\"name\":\"MEC30_x6_Overig\",\"state\":\"2\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":true, \\\"type\\\":\\\"standard\\\"}\"},\"a_attr\":{\"href\":\"#\",\"id\":\"MEC30_x6_Overig_anchor\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":true,\"disabled\":false,\"enabled\":true,\"type\":\"standard\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":true,\"type\":\"standard\"}},\"children\":[{\"id\":\"MEC30_x61_Verlenging_no_risk_polis\",\"text\":\"Verlenging No-riskpolis\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x61_Verlenging_no_risk_polis\",\"title\":\"Verlenging No-riskpolis\",\"name\":\"MEC30_x61_Verlenging_no_risk_polis\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"},{\"id\":\"MEC30_x62_Ophogen_uitkering_hulpbehoevendheid\",\"text\":\"Ophogen uitkering hulpbehoevendheid\",\"icon\":\"glyphicon glyphicon-text-size\",\"li_attr\":{\"id\":\"MEC30_x62_Ophogen_uitkering_hulpbehoevendheid\",\"title\":\"Ophogen uitkering hulpbehoevendheid\",\"name\":\"MEC30_x62_Ophogen_uitkering_hulpbehoevendheid\",\"state\":\"0\",\"data-jstree\":\"{\\\"enabled\\\":true,\\\"selected\\\":false,\\\"type\\\":\\\"textblock\\\"}\"},\"a_attr\":{\"href\":\"#\"},\"state\":{\"loaded\":true,\"opened\":false,\"selected\":false,\"disabled\":false,\"enabled\":true,\"type\":\"textblock\"},\"data\":{\"jstree\":{\"enabled\":true,\"selected\":false,\"type\":\"textblock\"}},\"children\":[],\"type\":\"textblock\"}],\"type\":\"standard\"}]";

            dynamic nodeIdArray = JsonConvert.DeserializeObject(data);

            foreach (var node in nodeIdArray)
            {
                Console.WriteLine(node.id.Value + ":" + node.li_attr.state.Value);
            }

        }

        //static void ParseXML()
        //{
        //    using (var db = new BravoContext())
        //    {
        //        var popups = from b in db.PopupTree
        //                    orderby b.BundleName
        //                    select b;

        //        foreach (var p in popups.Where(p => p.BundleName == "ME010_4_Vraagstelling"))
        //        {
        //            var docXml = new XmlDocument();
        //            string xml = p.XmlStructure;

        //            docXml.LoadXml(xml);
        //            XDocument doc = XDocument.Parse(docXml.OuterXml);
        //            if(doc.Root.Element("process").Element("object").Attribute("isradio") != null && doc.Root.Element("process").Element("object").Attribute("isradio").Value == "1")
        //                Console.WriteLine("is radio");

        //            XElement el = doc.Root.Element("process").Element("object");

        //            foreach (XElement x in el.Elements("object"))
        //            {
        //                x.SetAttributeValue("isradiotop", "1");
        //            }

        //            Console.WriteLine(el.Element("object").ToString());

        //            //string[] nodeIdArray = "MEC03_x11_EZWB,MEC30_x21_TVB2,MEC30_x31_WIA".Split(',');
        //            //string xpath = "//*[@name='" + p.BundleName + "']";
        //            //var selectedNode = doc.SelectSingleNode(xpath);

        //            //if (selectedNode != null)
        //            //{
        //            //    Console.WriteLine(selectedNode.Attributes["name"].Value);
        //            //}
        //        } 
        //    }            
        //}

        //static void AddNoteAttr(XElement c)
        //{
        //}

        //static void GetDocument()
        //{
        //    using (var db = new BravoContext())
        //    {
        //        string pdcProcessId = "ECE98100-5902-4CA1-ABAB-4BF8B3A0B320";
        //        //var doc = db.BravoDocument.Where(x => x.DocumentId == 12).FirstOrDefault();
        //        var doc = db.BravoDocument.Include("Popup").FirstOrDefault(d => d.DocumentId == 1977);

        //        foreach (Popup popup in doc.Popup.Where(p => p.PdcProcessId != null))
        //        {
        //            Console.WriteLine(popup.Id);
        //        }
        //    }
        //}
    }
}
