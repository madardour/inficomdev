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
    
    public partial class GegevensPeriode
    {
        public int Id { get; set; }
        public int InkomstenVerhoudingId { get; set; }
        public System.DateTime BeginDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public string InkomstenVermindering { get; set; }
    
        public virtual InkomstenVerhouding InkomstenVerhouding { get; set; }
    }
}
