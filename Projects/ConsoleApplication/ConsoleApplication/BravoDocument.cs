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
    
    public partial class BravoDocument
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public BravoDocument()
        {
            this.DocumentHistory = new HashSet<DocumentHistory>();
            this.DocumentVariable = new HashSet<DocumentVariable>();
            this.Popup = new HashSet<Popup>();
            this.TextBlock = new HashSet<TextBlock>();
        }
    
        public int DocumentId { get; set; }
        public int TemplateId { get; set; }
        public int CaseId { get; set; }
        public string DocumentXmlVariables { get; set; }
        public string DocumentXmlStructure { get; set; }
        public string MwsProcessId { get; set; }
        public string Title { get; set; }
        public Nullable<int> State { get; set; }
        public System.DateTime LastSaved { get; set; }
        public int LastSavedByUserId { get; set; }
        public bool IsSigned { get; set; }
        public bool IsContraSigned { get; set; }
        public string FileName { get; set; }
        public bool HasBeenSaved { get; set; }
        public int IsDerivedFrom { get; set; }
        public string ReferenceToRootDoc { get; set; }
        public byte[] Document { get; set; }
        public string PdcManVarXml { get; set; }
        public string LockedBySession { get; set; }
        public string LockedByUser { get; set; }
        public string HtmlDocument { get; set; }
    
        public virtual Case Case { get; set; }
        public virtual Template Template { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DocumentHistory> DocumentHistory { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<DocumentVariable> DocumentVariable { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Popup> Popup { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<TextBlock> TextBlock { get; set; }
    }
}
