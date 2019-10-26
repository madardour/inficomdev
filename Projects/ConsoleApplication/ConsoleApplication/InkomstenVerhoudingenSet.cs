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
    
    public partial class InkomstenVerhoudingenSet
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public InkomstenVerhoudingenSet()
        {
            this.InkomstenVerhouding = new HashSet<InkomstenVerhouding>();
        }
    
        public int Id { get; set; }
        public int CaseId { get; set; }
        public int TypeInkomstenVerhoudingSet { get; set; }
        public Nullable<System.DateTime> PeilDatum { get; set; }
        public Nullable<System.DateTime> PeilDatumExtraRefertePeriode { get; set; }
    
        public virtual Case Case { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<InkomstenVerhouding> InkomstenVerhouding { get; set; }
        public virtual MaatManResultaat MaatManResultaat { get; set; }
        public virtual PraktischeVerdienCapaciteitResultaat PraktischeVerdienCapaciteitResultaat { get; set; }
    }
}
