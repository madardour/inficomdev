using com.plutext.conversion;
using Spire.Doc;
using System;
using System.IO;

namespace ConsoleAppTest
{
    class Program
    {

        static void Main(string[] args)
        {
            Console.WriteLine("Start conversion");

            //SpireDoc();
            //UseOffice();
            Docx4j();

            Console.WriteLine("Conversion done!");
            Console.ReadLine();
        }

        static void Docx4j()
        {
            string inputFile = @"\\10.140.178.113\Share\Docs\Test01.docx";
            string outputFile = @"\\10.140.178.113\Share\Docs\toPDF3.pdf";

            using (Stream pdfStream = File.Create(outputFile))
            {
                Converter converter = new Converter("http://converter-eval.plutext.com/v1/00000000-0000-0000-0000-000000000000/convert");
                // you should install your own local instance, and point to that
                converter.convert(File.ReadAllBytes(inputFile), Format.DOCX, pdfStream, Format.PDF);
            }
        }

        static void UseOffice()
        {
            string inputFile = @"\\10.140.178.113\Share\Docs\Test01.docm";

            SautinSoft.UseOffice u = new SautinSoft.UseOffice();
            if (u.InitWord() == 0)
            {
                string outputFile = @"\\10.140.178.113\Share\Docs\toPDF2.PDF";
                u.ConvertFile(inputFile, outputFile, SautinSoft.UseOffice.eDirection.DOC_to_PDF);
            }
            u.CloseOffice();
        }

        static void SpireDoc()
        {
            string filePath = @"\\10.140.178.113\Share\Docs\Test01.docx";

            byte[] content = File.ReadAllBytes(filePath);
            Document document = new Document();

            using (MemoryStream docStream = new MemoryStream(content))
            {
                docStream.Position = 0;
                document.LoadFromStream(docStream, FileFormat.Docx2013);
                var pdfStream = new MemoryStream();
                document.SaveToStream(pdfStream, FileFormat.PDF);
                docStream.Position = 0;
                content = pdfStream.ToArray();
            }

            File.WriteAllBytes(@"\\10.140.178.113\Share\Docs\toPDF2.PDF", content);

            //document.SaveToFile(@"\\10.140.178.113\Share\Docs\toPDF.PDF", FileFormat.PDF);
        }
    }
}
