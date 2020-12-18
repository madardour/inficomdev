using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApplication
{
    public class CountingList : Dictionary<string, int>
    {
        //Dictionary<string, int> _countingList = new Dictionary<string, int>();

        readonly string[] _messages = new string[]
        {
            "Total cases succesfully processed",
            "Total number of documents processed",
            "Total number of PDC processes cleaned:"
        };

        public CountingList()
        {
            foreach (var msg in _messages)
            {
                Add(msg);
            }
        }
            public void Add(string s)
        {
            if (this.ContainsKey(s))
                this[s]++;
            else
                this.Add(s, 0);
        }
    }
}
