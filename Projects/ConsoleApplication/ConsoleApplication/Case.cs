//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ConsoleApplication
{
    using System;
    using System.Collections.Generic;
    
    public partial class Case
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Case()
        {
            this.ArbeidsVerleden = new HashSet<ArbeidsVerleden>();
            this.BravoDocument = new HashSet<BravoDocument>();
            this.InkomstenVerhoudingenSet = new HashSet<InkomstenVerhoudingenSet>();
        }
    
        public int Id { get; set; }
        public string SimCasusId { get; set; }
        public string FlowerCaseId { get; set; }
        public bool IsActive { get; set; }
        public int ClientId { get; set; }
        public Nullable<int> ProcessOrLawId { get; set; }
        public Nullable<int> ProductId { get; set; }
        public string SuwiCode { get; set; }
        public string Gemeentenaam { get; set; }
        public string Gemeentecode { get; set; }
        public Nullable<System.DateTime> DatumOntvangstAanvraag { get; set; }
        public string TeamNummer { get; set; }
        public Nullable<System.DateTime> DatAfsluitenSmf { get; set; }
        public Nullable<System.DateTime> DatEDoelbinding { get; set; }
        public Nullable<int> IndTenOnrechteOpgevoerd { get; set; }
        public Nullable<int> OfficeId { get; set; }
        public bool UpaSuccesfull { get; set; }
        public Nullable<System.DateTime> EersteAoDag { get; set; }
        public Nullable<System.DateTime> DatumEWT { get; set; }
        public bool IndicatieHerbeoordeling { get; set; }
        public bool IndCasusBzInternationaal { get; set; }
        public string VraagstellingAanvullend { get; set; }
        public string OmsProductcd { get; set; }
        public string VraagstellingVA { get; set; }
        public string VraagstellingAD { get; set; }
        public int LaunchCodeId { get; set; }
        public Nullable<System.DateTime> PeildatumArbeidsVerleden { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ArbeidsVerleden> ArbeidsVerleden { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BravoDocument> BravoDocument { get; set; }
        public virtual Client Client { get; set; }
        public virtual LaunchCode LaunchCode { get; set; }
        public virtual Office Office { get; set; }
        public virtual ProcessOrLaw ProcessOrLaw { get; set; }
        public virtual Product Product { get; set; }
        public virtual HerindexeringMaatman HerindexeringMaatman { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<InkomstenVerhoudingenSet> InkomstenVerhoudingenSet { get; set; }
        public virtual MedischeBeperking MedischeBeperking { get; set; }
        public virtual TheoretischeVerdienCapaciteit TheoretischeVerdienCapaciteit { get; set; }
    }
}