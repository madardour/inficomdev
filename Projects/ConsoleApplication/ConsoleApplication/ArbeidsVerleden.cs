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
    
    public partial class ArbeidsVerleden
    {
        public int Id { get; set; }
        public Nullable<System.DateTime> DatumBegin { get; set; }
        public Nullable<System.DateTime> DatumEinde { get; set; }
        public string Functie { get; set; }
        public Nullable<int> Urenperweek { get; set; }
        public string LoonHeffingenNummer { get; set; }
        public string Naam { get; set; }
        public bool Selected { get; set; }
        public Nullable<int> Case_Id { get; set; }
    
        public virtual Case Case { get; set; }
    }
}
