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
    
    public partial class DocumentHistory
    {
        public int DocumentHistoryId { get; set; }
        public int BravoDocumentId { get; set; }
        public int EndUserId { get; set; }
        public int AuthorizedActionId { get; set; }
        public int State { get; set; }
        public System.DateTime ModificationDate { get; set; }
        public int BravoDocument_DocumentId { get; set; }
    
        public virtual AuthorizedAction AuthorizedAction { get; set; }
        public virtual BravoDocument BravoDocument { get; set; }
        public virtual EndUser EndUser { get; set; }
    }
}