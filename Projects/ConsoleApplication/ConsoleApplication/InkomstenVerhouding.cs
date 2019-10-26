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
    
    public partial class InkomstenVerhouding
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public InkomstenVerhouding()
        {
            this.CbsIndexIkv = new HashSet<CbsIndexIkv>();
            this.GegevensPeriode = new HashSet<GegevensPeriode>();
            this.InkomstenOpgave = new HashSet<InkomstenOpgave>();
        }
    
        public int InkomstenVerhoudingId { get; set; }
        public int InkomstenVerhoudingenSetId { get; set; }
        public int WerkgeverGegevensId { get; set; }
        public Nullable<System.DateTime> DatumBegin { get; set; }
        public Nullable<System.DateTime> DatumEinde { get; set; }
        public int CodeHerKomst { get; set; }
        public Nullable<int> IndicatieIndexCijferGrensBinnenRefertePeriode { get; set; }
        public int CodeTijdVakInkomstenOpgave { get; set; }
        public int AantalTijdvakken { get; set; }
        public int AantalGewerkteTijdvakken { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<CbsIndexIkv> CbsIndexIkv { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<GegevensPeriode> GegevensPeriode { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<InkomstenOpgave> InkomstenOpgave { get; set; }
        public virtual InkomstenVerhoudingenSet InkomstenVerhoudingenSet { get; set; }
        public virtual WerkgeverGegevens WerkgeverGegevens { get; set; }
        public virtual MaatManLoon MaatManLoon { get; set; }
    }
}
