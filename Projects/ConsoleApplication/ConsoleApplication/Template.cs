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
    
    public partial class Template
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Template()
        {
            this.AosCode = new HashSet<AosCode>();
            this.BravoDocument = new HashSet<BravoDocument>();
            this.Template1 = new HashSet<Template>();
            this.Template11 = new HashSet<Template>();
        }
    
        public int TemplateId { get; set; }
        public string Name { get; set; }
        public int BRaVoDocumentTypeId { get; set; }
        public string TemplateTypeSuffix { get; set; }
        public string TemplateNameWithoutSuffix { get; set; }
        public Nullable<int> DerivedTemplate_TemplateId { get; set; }
        public Nullable<int> DerivedTemplateId { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AosCode> AosCode { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BravoDocument> BravoDocument { get; set; }
        public virtual DocumentType DocumentType { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Template> Template1 { get; set; }
        public virtual Template Template2 { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Template> Template11 { get; set; }
        public virtual Template Template3 { get; set; }
    }
}